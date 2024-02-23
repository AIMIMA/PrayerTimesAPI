// alert("test")

function getLocation() {
    navigator.geolocation ? navigator.geolocation.getCurrentPosition(success) : console.log("Geolocation is not supported by this browser.");
}

async function success(pos) {
    console.log(`#`.repeat(70))
    let coords = [pos.coords.latitude, pos.coords.longitude]
    await locationInfo(coords[0],coords[1])
    console.log(`#`.repeat(70))
}

async function locationInfo(lat,lot){
    // Get Full Date DD-MM-YYYY
    let today = new Date()
    let datetime = new DateAndTime(today)
    console.log(datetime.specialDate())

    // Get All Countries
    const config = {
        method: 'GET',
        url: 'https://api.countrystatecity.in/v1/countries',
        headers: {
            'X-CSCAPI-KEY': 'Nk10NE11bkdSVGpKbjl4aDVRQkdSeGFoRFk1VkNHalIyYW1NVVplaw=='
        }
    };
    let requestCountries = await axios(config)
    let countries = requestCountries.data
    // console.log(countries)

    // Get Current Location Details by LocationIQ website
    const tokkenKey = `pk.6c8a80d474c2b72b1d9e43a66e30d1c5` 
    let requestLocationInfo = await axios.get(`https://us1.locationiq.com/v1/reverse?key=${tokkenKey}&lat=${lat}&lon=${lot}&format=json`)
    let apiLocInfo = requestLocationInfo.data
    let locateInfo = new Details(apiLocInfo.lat, apiLocInfo.lon, apiLocInfo.address.country, apiLocInfo.address.state)
    // console.log(locateInfo)
    let latitude = Number(apiLocInfo.lat)
    console.log(latitude)
    console.log(typeof latitude)
    await prayerApi(apiLocInfo.lat, apiLocInfo.lon, locateInfo, datetime, countries)
}

async function prayerApi(lat, lon, locateInfo, fullDate, countries, selectedCountry, ) {
    let url = ""
    if(isNaN(lat) && isNaN(lon)) {
        url = `https://api.aladhan.com/v1/timings/${fullDate.fullDate()}?city=${ALX}&country=${Egypt}`
    }else {
        url = `https://api.aladhan.com/v1/timings/${fullDate.fullDate()}?latitude=${lat}&longitude=${lon}`
    }
    // console.log(lat)
    // console.log(typeof lat)
    // Get Prayer Api Details by alahdan website
    let prayerTimingApi = await axios.get(url)
    let prayerDetails = prayerTimingApi.data.data
    // 
    setInfo(locateInfo, prayerDetails, fullDate)
    setPrayerTimes(prayerDetails.timings)
    setCountriesSelection(countries, locateInfo, fullDate)
    
}
btn()




function changeCountry(){
    // let selectCities = document.querySelector(`#chooseCity`)
    // let selectCountries = document.querySelectorAll(`#chooseCountry op`)
}






function btn() {
    let btn = document.querySelector(`.btn`)
    btn.addEventListener(`click`, () => {
        let selectCountries = document.querySelector(`#chooseCountry`)
        let selectCities = document.querySelector(`#chooseCity`)
        selectCountries.toggleAttribute(`disabled`)
        selectCities.toggleAttribute(`disabled`)
    })
}





function setCountriesSelection(countries, locateInfo, fullDate){
    let currentCountry = locateInfo.country
    let selectedCountry = document.querySelector(".change #chooseCountry")
    for(country of countries) {
        let option = document.createElement(`option`)
        option.setAttribute(`iso2`, `${country.iso2}`)
        option.appendChild(document.createTextNode(`${country.name}`))
        if(country.name === currentCountry){
            option.setAttribute(`selected`, `selected`)
            setCitiesSelection(country.iso2, locateInfo)
        }
        selectedCountry.appendChild(option)
    }
    selectedCountry.addEventListener(`change`, () => {
        console.log(selectedCountry.value)
        let countryIso2 = ""
        let country
        const matchingOptions = Array.from(selectedCountry.options).filter(
            option => option.value === selectedCountry.value
            );
            // Step 4: Select the first option element that matches the new value
            if (matchingOptions.length > 0) {
                matchingOptions[0].selected = true;
                // Step 5: Log the selected option element to the console
                console.log(matchingOptions[0]);
                countryIso2 = matchingOptions[0].iso2
            }
        // setCitiesSelection(,)
        // prayerApi(1,1,currentCountry, fullDate, countries, selectedCountry)
    })
    // changeCountry()
    
}

async function setCitiesSelection(iso2, locateInfo) {
    console.log(typeof locateInfo)
    let currentCity = ""
    if(typeof locateInfo === `object`){
        currentCity = locateInfo.city
    }else {
        currentCity = locateInfo
    }
    let config = {
        method: 'get',
        url: `https://api.countrystatecity.in/v1/countries/${iso2}/states`,
        headers: {
            'X-CSCAPI-KEY': 'Nk10NE11bkdSVGpKbjl4aDVRQkdSeGFoRFk1VkNHalIyYW1NVVplaw=='
        }
    };
    let citiesOfSpecificCountry = await axios(config)
    let reqCities = citiesOfSpecificCountry.data
    // console.log(reqCities)
    let selectCities = document.querySelector(`.change #chooseCity`)
    reqCities.forEach(city => {
        let option = document.createElement(`option`)
        option.setAttribute(`iso2`, `${city.iso2}`)
        option.appendChild(document.createTextNode(`${city.name}`))
        if(city.name === currentCity){
            option.setAttribute(`selected`, `selected`)
            setCitiesSelection(city.iso2)
        }
        selectCities.appendChild(option)
    });

}

function setInfo(locateInfo, prayerDetails, fullDate){
    let htmlCity = document.querySelector(".wrapper .details .info .city span")
    let htmlMethod = document.querySelector(".wrapper .details .info .method")
    let htmlFullDate = document.querySelector(".wrapper .details .info .fullDate")
    
    htmlCity.innerHTML = locateInfo.city
    htmlMethod.innerHTML = prayerDetails.meta.method.name
    htmlFullDate.innerHTML = fullDate.specialDate()
}

function timeing(classes, times){
    document.querySelector(`.prayerTime .${classes} .time`).innerHTML = times
}

function setPrayerTimes(times){
    let prayerTimes = document.querySelectorAll(".prayerTime > div")
    Object.keys(times).forEach(key => {
        for(prayerTime of prayerTimes){
            if(prayerTime.className === key.toLowerCase()) {
                timeing(key.toLowerCase(), times[key])
            }
        }
    });
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
    constructor(latitude, longitude, countr, ci) {
        this.lat = latitude;
        this.lon = longitude;
        this.country = countr;
        this.city = ci;
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
getLocation()