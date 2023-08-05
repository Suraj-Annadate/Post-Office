const beforeClick = document.getElementById('container');
const afterClick = document.getElementById('container-2');
const searchBtn = document.getElementById('search-ip');

// Step - 1 
window.addEventListener('DOMContentLoaded', async () => {
    const ipAddressElement = document.getElementById('co-ordinates');

    try {
        const response = await fetch("https://ipinfo.io/223.233.80.94?token=7fb950141973cc");
        const data = await response.json();
        
        ipAddressElement.textContent = data.ip;
        
        console.log(data);
    } catch (error) {
        ipAddressElement.textContent = '127.0.01';
        console.log('Error fetching IP address:', error);
    }
});



// Step - 2
searchBtn.addEventListener('click', async () => {
    beforeClick.style.display = 'none';
    afterClick.style.display = 'block';
    console.log('search ip button clicked');
    const ipAddressElement = document.getElementById('co-ordinates-display');
    const ipAddFields = document.getElementsByClassName('add');
    const map = document.getElementsByTagName('iframe')[0];

    const latitude = ipAddFields[0];
    const longitude = ipAddFields[1];
    const city = ipAddFields[2];
    const region = ipAddFields[3];
    const organisation = ipAddFields[4];
    const hostname = ipAddFields[5];

    try {

        const response = await fetch("https://ipinfo.io/223.233.80.94?token=7fb950141973cc");
        const data = await response.json();

        // Fetchching the geo information 
        const geoResponse = await fetch(`http://api.ipstack.com/${data.ip}?access_key=e7c237e6062bd6c622f381d13fd094af`);
        const geoData = await geoResponse.json();
        console.log(geoData);
        displayInfo(geoData);

        // Updating the content 
        const [lat, long] = data.loc.split(',');

        ipAddressElement.textContent = geoData.ip;
        latitude.textContent = lat;
        longitude.textContent = long;
        organisation.textContent = data.org;
        city.textContent = geoData.city;
        hostname.textContent = data.hostname;
        region.textContent = geoData.region_name;
        
        const newSrc = `https://maps.google.com/maps?q=${geoData.latitude}, ${geoData.longitude}&z=15&output=embed`; 
        map.src=newSrc;
        
    } catch (error) {
        ipAddressElement.textContent = '127.0.01';
        console.log('Error fetching IP address:', error);
    }
});


// Step - 3 
function displayInfo(geoData) {
    // extract timezone
    const timezone = new Intl.DateTimeFormat(undefined, { timeZoneName: 'long' }).format();

    const info_location = document.getElementsByClassName('info-display');

    const time_zone = info_location[0];
    const date_time = info_location[1];
    const pincode = info_location[2];

    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    const date = timezone.split(',')[0];

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const formattedTime = `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;

    function padZero(number) {
        return number < 10 ? `0${number}` : number;
    }
    console.log(date);
    console.log(formattedTime); 
    console.log(timezone.split(',')[1].trim());

    const pin_code = geoData.zip;
    console.log(pin_code);

    time_zone.textContent = timezone.split(',')[1];
    date_time.textContent = ` ${date} ${formattedTime}`;
    pincode.textContent = ` ${geoData.zip}` || ' Not available';

    getPincodes(geoData);
}

// Step - 4
async function getPincodes(geoData) {
    const message = document.getElementById('msgId');
    const pincodeInfoResponse = await fetch(`https://api.postalpincode.in/pincode/${geoData.zip}`);
    const pincodeInfoData = await pincodeInfoResponse.json();
    console.log(pincodeInfoData);
    message.textContent = `Number of pincode(s) found: ${pincodeInfoData[0].PostOffice.length}`;

    if (Array.isArray(pincodeInfoData[0].PostOffice) && pincodeInfoData.length > 0) {
        displayPO(pincodeInfoData[0].PostOffice);
    }
}

var postOffice_list = null;
function displayPO (postOffices) {
    if (postOffice_list === null) postOffice_list = postOffices;
    const cardBox = document.getElementById('card');
    cardBox.innerHTML = '';
    console.log(postOffices);
    postOffices.forEach(postOffice => {
        const po_card = document.createElement('div');
        po_card.className = 'po-card';
        po_card.innerHTML = `
                <div>
                    <p><span>Name: ${postOffice.Name}</span></p>
                </div>
                <div>
                    <p><span>Branch Type : ${postOffice.BranchType}</span></p>
                </div>
                <div>
                    <p><span>Delivery Status : ${postOffice.DeliveryStatus}</span></p>
                </div>
                <div>
                    <p><span>District : ${postOffice.District}</span></p>
                </div>
                <div>
                    <p><span>Division : ${postOffice.Division}</span></p>
                </div>
            `;
        cardBox.appendChild(po_card);
    });
}

// Step - 5
const searchBar = document.getElementById('filterBox');
searchBar.addEventListener('keyup', () => {
    console.log('keyup event', searchBar.value.toLowerCase());
    let searched_term =  searchBar.value.toLowerCase();
    const filteredPOs = filterData(searched_term);

    displayPO(filteredPOs);
});


function filterData(searched_term) {
    var ansArray = postOffice_list.filter((postOffice) => {
        if (postOffice.Name.toLowerCase().includes(searched_term)) {
            return postOffice;
        }
    });

    return ansArray;
}