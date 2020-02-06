import React, { Component } from 'react';
import { callWeatherAPI } from './utils';
import { callAlertsMap, alertsMap } from './Alerts';
import { callDayMap, thisWeekMap } from './CallDayMap';
import { handleHourlyMap, HourlyTableHead, hourlyMap } from './HourlyMap';
import { setSearchCookie, getSearchCookie } from './cookies'
import { handleToday, TodayComp } from './Today'
import Footer from './Footer'
import ReactGA from 'react-ga';
// import LazyLoad from 'react-lazyload'

ReactGA.initialize('UA-136509113-9');
ReactGA.pageview(window.location.pathname + window.location.search);

let weatherArray = []
let curr = []
let dayArray = []
let alerts = []
let hourlyArray = []
let today = []
let userSearchCookie = ''
let todaySunsetTime = '';
let todaySunriseTime = ''
let todayCurrentTime = '';

class Weather extends Component {
    constructor(props){
        super(props);
        this.state = {
            input: '',
            error: '',
            errorSwitch: false,
            alertSwitch: false,
            switch: false,
            loading: '',
            alertContentSwitch: false,
            isNightTime: false,
            nightModeClass: 'App'
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleAlertContent = this.handleAlertContent.bind(this);
    }
    dayOrNight(sunset, sunrise, current){
        // console.log("Hello from day or night")
        if(sunset < current || current < sunrise){
            this.setState({isNightTime: true, nightModeClass: 'Night-mode'})
        } else {
            this.setState({isNightTime: false, nightModeClass: 'App'})
        }
    }
    handleGetWeather(searchTerm){
        this.setState({switch: false})
        this.setState({alertSwitch: false})
        this.setState({loading: '...getting forecast'})
        callWeatherAPI(searchTerm).then((res) => {
            // Set error to true ...
            this.setState({errorSwitch: true})
            weatherArray = res;
            console.log(weatherArray)
            curr = weatherArray.forecast.currently;
            dayArray = weatherArray.forecast.daily.data;
            hourlyArray = weatherArray.forecast.hourly.data;
            handleHourlyMap(hourlyArray)
            today = dayArray.shift()
            handleToday(curr, today);
            callDayMap(dayArray);
            if(weatherArray.forecast.alerts) {
                alerts = weatherArray.forecast.alerts;
                if(alerts.length > 0) {
                    this.setState({alertSwitch: true})
                    callAlertsMap(alerts)
                }
            }
            todayCurrentTime = new Date()
            todaySunsetTime = new Date(today.sunsetTime * 1000)
            todaySunriseTime = new Date(today.sunriseTime * 1000)
            this.dayOrNight(todaySunsetTime, todaySunriseTime, todayCurrentTime);
            if(todayCurrentTime > weatherArray.forecast.currently.time * 1000 * 60 * 30){
                window.location.reload(true)
            }
            this.setState({error: res.error})
            // We will remove the loading message
            this.setState({loading: ''})
            // We set switch to true which will now render all the data
            this.setState({switch: true})
            //Because everything has worked at this point, we will reset error switch to false
            this.setState({errorSwitch: false})
        }).catch(err => console.log(err))
    }

    handleChange(evt){
        this.setState({input: evt.target.value})
    }

    handleSubmit(evt){
        evt.preventDefault();
        this.handleGetWeather(this.state.input);
        setSearchCookie("search", this.state.input, 30)
    }

    handleAlertContent(){
        if(!this.state.alertContentSwitch){
            this.setState({alertContentSwitch: true})
        } else {
            this.setState({alertContentSwitch: false})
        }
    }

    componentDidMount(){
        userSearchCookie = getSearchCookie('search')
        if(userSearchCookie === '') {
            return '';
        }
        this.handleGetWeather(userSearchCookie);
        
    }
    
    render(){
    	return(
    		<div className={`${this.state.nightModeClass}`}>
                <div className="Margin-div">
                    <div className="Weather-Header">
                        <h2>Whether App</h2>
                        <p className="sub-item-desc">
                            Find out whether you want to go outside or not
                        </p>

                        {/* FORM TO HANDLE SEARCH INPUT */}
                        <form onSubmit={this.handleSubmit}>
                            <label>Location: </label>
                            <input value={this.state.input} onChange={this.handleChange} />
                            <button id="Get-weather">Get</button>
                        </form>
                    </div>
                <div>
                    {/* IF ERROR SWITCH IS TRUE, THE FORMER TEXT IS DISPLAYED */}
                    {this.state.errorSwitch 
                    ? <h4>"Sorry, check your connection or provide a valid search term"</h4>
                    :''}

                    <p className="Weather-location">
                        {weatherArray.name}
                    </p>
                    <div>
                        {/* RENDERS ALL THE CONTENT IF ITS BEEN FETCHED, OR loading state */}
                        {this.state.switch
                        ? <div className="Weather-container">
                            {this.state.alertSwitch
                            ?<div>
                                <div className="Alert-button" onClick={this.handleAlertContent}>
                                    Alerts!
                                </div>
 
                                {this.state.alertContentSwitch
                                ? <div className="Alert-content">
                                    <h4>Alerts:</h4>
                                    {alertsMap}
                                </div>
                                :''}
                            </div>
                            :''}
                            
                            <TodayComp />

                            {/* <LazyLoad height={100} offset={-50}> */}
                                <h3 className="align-center">
                                    Hourly:
                                </h3>
                                
                                <div className="Weather-hourly-data fade-in">
                                    <HourlyTableHead />
                                    <div className="Weather-hourly-map fade-in">
                                        {hourlyMap}
                                    </div>
                                </div>
                            {/* </LazyLoad> */}
                            {/* <LazyLoad height={100} offset={-50}> */}
                                <h3 className="align-center">This Week:</h3>
                                <div className="This-week-content-container fade-in">
                                    <div className="This-week-key fade-in">
                                        <p>Day</p>
                                        <p>Summary</p>
                                        <p></p>
                                        <p>High</p>
                                        <p>Low</p>
                                        <p>Sunrise</p>
                                        <p>Sunset</p>
                                        <p>Precip</p>
                                        <p>Chance</p>
                                        <p>Wind</p>
                                        <p>Gust</p>
                                        <p>Cloud %</p>
                                        <p>Pressure</p>
                                        <p>Humidity</p>
                                    </div>
                                    <div className="This-week-map-container">
                                        {thisWeekMap}
                                    </div>
                                </div>
                            {/* </LazyLoad> */}
                            {/* <div className="Margin-bottom-50"></div> */}
                            
                        </div>
                    :<div className="Loading">
                        {this.state.loading}
                    </div>}
                    </div>
                </div>
                <div className="Padding-bottom-100">
                    {'<3'}
                </div>
                
                <Footer />
                <div></div>

                </div>
                
    		</div>
    	);
    }
}
export default Weather;