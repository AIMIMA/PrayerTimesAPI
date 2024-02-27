// alert("test")
/*
let informationObj = {
    lat: 1,
    lon: 1,
    locateInfo: {
        city: ``,
        country: ``,
    },
    allCountries: getAllCountries(),
    today: new Date(),
    fullDate: null,
}
*/
// ###################################################################################################

function getLocationCoords() {
    navigator.geolocation ? navigator.geolocation.getCurrentPosition(success) : console.log("Geolocation is not supported by this browser.");
}

async function success(pos) {
    console.log(`#`.repeat(70))
    let coords = [pos.coords.latitude, pos.coords.longitude]
    await locationInfo(coords[0],coords[1])
    console.log(`#`.repeat(70))
}

async function locationInfo(lat,lot){
    let locDetailsApi = await getCurrentLocationDetails(lat, lot)
    let locationDetails = new Details(locDetailsApi.lat, locDetailsApi.lon, locDetailsApi.address.country, locDetailsApi.address.state, locDetailsApi.address["country_code"].toUpperCase())
    await startProject(locationDetails)    
}

async function startProject(locationDetails) {
    let today = new Date()
    let dateAndTime = new DateAndTime(today)
    let allCountries = await getAllCountries()
    let currentCountry = locationDetails.countryName
    let selectBoxCountries = document.querySelector(".change #chooseCountry")
    for(country of allCountries) {
        let option = document.createElement(`option`)
        option.setAttribute(`iso2`, `${country.iso2}`)
        option.appendChild(document.createTextNode(`${country.name}`))
        if(country.name === currentCountry) {
            option.setAttribute(`selected`, `selected`)
            locationDetails.countryIso2 = country.iso2
            locationDetails.countryName = country.name
            setCitiesSelection(locationDetails, dateAndTime)
        }
        selectBoxCountries.appendChild(option)
    }
    selectBoxCountries.addEventListener(`change`, async () => {
        let countryIso2 = ""
        let countryName = ""
        const matchingOptions = Array.from(selectBoxCountries.options).filter(
            option => option.value === selectBoxCountries.value
        );
        // Step 4: Select the first option element that matches the new value
        if (matchingOptions.length > 0) {
            matchingOptions[0].selected = true;
            // Step 5: Log the selected option element to the console
            countryIso2 = matchingOptions[0].getAttribute(`iso2`)
            countryName = matchingOptions[0].innerHTML
            locationDetails.countryName = countryName
            locationDetails.countryIso2 = countryIso2

            console.log(locationDetails)
            setCitiesSelection(locationDetails, dateAndTime)
        }
    })
}
async function setCitiesSelection(locationDetails, dateAndTime) {
    let selectBoxCities = document.querySelector(`.change #chooseCity`)
    selectBoxCities.innerHTML = ""
    let currentCity = ""
    currentCity = locationDetails.cityName
    let citiesApi = await getCityByCountryIso2(locationDetails.countryIso2)
    citiesApi.forEach(async city => {
        let option = document.createElement(`option`)
        option.setAttribute(`iso2`, `${city.iso2}`)
        option.appendChild(document.createTextNode(`${city.name}`))
        if(city.name === currentCity){
            option.setAttribute(`selected`, `selected`)
            locationDetails.cityName = city.name
            locationDetails.cityIso2 = city.iso2

            console.log(locationDetails)
            setInfo(locationDetails, dateAndTime)
        }
        selectBoxCities.appendChild(option)
    });

    selectBoxCities.addEventListener(`change`, async () => {
        let cityIso2 = ""
        let cityName = ""
        const matchingOptions = Array.from(selectBoxCities.options).filter(
            option => option.value === selectBoxCities.value
        );
        // Step 4: Select the first option element that matches the new value
        if (matchingOptions.length > 0) {
            matchingOptions[0].selected = true;
            // Step 5: Log the selected option element to the console
            cityIso2 = matchingOptions[0].getAttribute(`iso2`)
            cityName = matchingOptions[0].innerHTML
            locationDetails.cityName = cityName
            locationDetails.cityIso2 = cityIso2
            console.log(locationDetails)
            setInfo(locationDetails, dateAndTime)
        }
        // let prayerApi = await getPrayerApi(dateAndTime, locationDetails.country, cityIso2, locationDetails.countryIso2)
        // prayerApi.meta.method.name
        // startProject(locationDetails)
    })
}
async function setInfo(locationDetails, dateAndTime){
    let prayerApi = await getPrayerApi(dateAndTime, locationDetails.countryName, locationDetails.cityIso2, locationDetails.countryIso2)
    let htmlCity = document.querySelector(".wrapper .details .info .city span")
    let htmlMethod = document.querySelector(".wrapper .details .info .method")
    let htmlFullDate = document.querySelector(".wrapper .details .info .fullDate")
    let methodCity = prayerApi.meta.method.name
    let timings = prayerApi.timings

    htmlCity.innerHTML = locationDetails.cityName
    htmlMethod.innerHTML = methodCity
    htmlFullDate.innerHTML = dateAndTime.specialDate()

    console.log(locationDetails)

    setPrayerTimes(timings)
}


// #############################################

// Get All Countries
async function getAllCountries() {
    const config = {
        method: 'GET',
        url: 'https://api.countrystatecity.in/v1/countries',
        headers: {
            'X-CSCAPI-KEY': 'Nk10NE11bkdSVGpKbjl4aDVRQkdSeGFoRFk1VkNHalIyYW1NVVplaw=='
        }
    };
    let requestCountries = await axios(config)
    let countries = await requestCountries.data
    return countries
}

// Get Current Location
async function getCurrentLocationDetails(lat, lot) {
    const tokkenKey = `pk.6c8a80d474c2b72b1d9e43a66e30d1c5` 
    let requestLocationInfo = await axios.get(`https://us1.locationiq.com/v1/reverse?key=${tokkenKey}&lat=${lat}&lon=${lot}&format=json`)
    let locDetailsApi = requestLocationInfo.data
    return locDetailsApi
}4

// 
async function getPrayerApi(fullDate, selectedCountry, selectedCity, countryIso2) {
    let url = `https://api.aladhan.com/v1/timingsByCity/${fullDate.fullDate()}?city=${countryIso2}-${selectedCity}&country=${selectedCountry}`
    console.log(url)
    let prayerTimingApi = await axios.get(url)
    let prayerDetails = prayerTimingApi.data.data
    return prayerDetails
}

// 
async function getCityByCountryIso2(iso2) {
    let config = {
        method: 'GET',
        url: `https://api.countrystatecity.in/v1/countries/${iso2}/states`,
        headers: {
            'X-CSCAPI-KEY': 'Nk10NE11bkdSVGpKbjl4aDVRQkdSeGFoRFk1VkNHalIyYW1NVVplaw=='
        }
    };
    let citiesOfSpecificCountry = await axios(config)
    let reqCities = citiesOfSpecificCountry.data
    return reqCities
}

// ######################################################

// Set Basic Information

function timing(classes, times){
    document.querySelector(`.prayerTime .${classes} .time`).innerHTML = times
}

function setPrayerTimes(times){
    let prayerTimes = document.querySelectorAll(".prayerTime > div")
    Object.keys(times).forEach(key => {
        for(prayerTime of prayerTimes){
            if(prayerTime.className === key.toLowerCase()) {
                timing(key.toLowerCase(), times[key])
            }
        }
    });
}

function btn() {
    let btn = document.querySelector(`.btn`)
    btn.addEventListener(`click`, () => {
        let selectBoxCountries = document.querySelector(`#chooseCountry`)
        let selectBoxCities = document.querySelector(`#chooseCity`)
        selectBoxCountries.toggleAttribute(`disabled`)
        selectBoxCities.toggleAttribute(`disabled`)
    })
}




class DateAndTime {
    constructor(date) {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        this.days = date.getDay(),
        this.day = date.getDate(),
        this.month = date.getMonth(),
        this.year = date.getFullYear(),
        this.fullDate = () => {
            return `${this.day < 10 ? `0${this.day}`: this.day}-${this.month + 1 < 10 ? `0${this.month + 1}` : this.month + 1}-${this.year}`
        }
        this.specialDate = () => {
            return `${daysOfWeek[this.days]}, ${this.day} ${months[this.month]} ${this.year}`
        }
    }
}

class Details {
    constructor(latitude, longitude, country, city, countrIso2, cityIso2) {
        this.lat = latitude;
        this.lon = longitude;
        this.countryName = country;
        this.cityName = city;
        this.countryIso2 = countrIso2;
        this.cityIso2 = cityIso2;
    }
}



/**
class Prayer {
    constructor(meth, faj, sunr, dhu, as, magh, ish) {
        this.method = meth;
        this.fajr = faj;
        this.sunrise = sunr;
        this.dhuhr = dhu;
        this.asr = as;
        this.maghrib = magh;
        this.isha = ish;
    }
}
*/
getLocationCoords()
btn()
