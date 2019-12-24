import React, {Component} from 'react';
import {Redirect} from 'react-router';
import '../../css/Home.css';
import logo from '../../resources/logo.svg';
import notification from '../../resources/notification.svg';
import profile from '../../resources/profile.svg';
import Calendar from '../calendar/Calendar';
import Profile from '../profile/Profile';
import UserProfile from '../../data/UserProfile';
import {MonthNames} from './Constants';
import {DbConstants} from "../../data/DbConstants";
import Networks from "../networks/Networks";
import NetworkGroup from "../../data/NetworkGroup";

const Pages = {  // The main tabs that a user can view; the value is the 'id' of the tab <button>
    CALENDAR: 'my-calendar',
    NETWORKS: 'my-networks',
    PROFILE: 'my-profile'
};

// TODO: Move EVENT list to Home component to prevent unnecessary calls to DB

class Home extends Component {
    constructor(props) {
        super(props);

        this.user = this.props.firebase.auth().currentUser;  // The authenticated user; null if none is authenticated
        this.db = this.props.firebase.firestore();  // The Firebase Firestore (used as user database)

        this.state = {
            currentTab: Pages.CALENDAR,  // The active tab selected by the user (this is the starting tab)
            userProfile: null,  // The current user's profile
            networkGroups: []
        };

        this.queryUserProfileFromId = this.queryUserProfileFromId.bind(this);
        this.queryUserNetworks = this.queryUserNetworks.bind(this);
        this.queryNetworkGroups = this.queryNetworkGroups.bind(this);
        this.queryUserProfile = this.queryUserProfile.bind(this);
        this.setActiveTab = this.setActiveTab.bind(this);

        this.queryUserProfile();
    }

    queryUserProfile() {
        /**
         * Queries the Firestore for the current user's information and
         * saves the user's first name, last name, email, and uid.
         */
        if (this.user == null) {
            return null;  // There is no authenticated user
        } else {  // Create the UserProfile from query result
            this.db.collection(DbConstants.USERS)
                .doc(this.user.uid)
                .collection(DbConstants.PROFILE).get()
                .then(doc => {
                    if (doc.empty) {
                        // TODO: Display error to user
                        console.error('No user profile found!');
                    } else {
                        // const profile = doc.docs[0].data();
                        // const userProfile = new UserProfile(profile.firstName, profile.lastName, this.user.email, this.user.uid, []);
                        // this.setState({userProfile});
                        // this.queryUserNetworks();

                        const profile = doc.docs[0].data();
                        this.queryUserNetworks(profile.firstName, profile.lastName, this.user.email, this.user.uid);
                    }
                });
        }
    }

    queryUserNetworks(firstName, lastName, email, uid) {
        /**
         * Queries the Firestore for the current user's networks and saves
         * them to the user's profile as a list of network IDs.
         */
        if (this.user == null) {
            return null;  // There is no authenticated user
        } else {  // Get the user's networks
            this.db.collection(DbConstants.USERS)
                .doc(this.user.uid)
                .collection(DbConstants.NETWORKS).get()
                .then(doc => {
                    if (doc.empty) {
                        // TODO: Display error to user
                        console.error('No user networks found!');
                    } else {
                        // const networkData = doc.docs[0].data();
                        // const networkList = networkData[DbConstants.MEMBER_OF];
                        // const userProfile = this.state.userProfile;
                        // userProfile.setNetworks(networkList);
                        // this.setState({userProfile});

                        const networkData = doc.docs[0].data();
                        const networkList = networkData[DbConstants.MEMBER_OF];
                        const userProfile = new UserProfile(firstName, lastName, email, uid, networkList);
                        this.setState({userProfile});
                        this.queryNetworkGroups(networkList);
                    }
                });
        }
    }

    queryNetworkGroups(networkListUid) {
        /**
         * Queries the Firestore for all networks and saves those which the current user is in.
         */

            // TODO: Change this function to make multiple calls?
        // const networkGroups = this.state.networkGroups;
        this.db.collection(DbConstants.NETWORKS).get()
            .then(col => {
                if (col.empty) {
                    // TODO: Display error to user
                    console.error('No networks found!');
                } else {
                    console.log(col.docs.length + ' networks found');
                    for (const doc of col.docs) {
                        if (networkListUid.includes(doc.id)) {
                            const network = doc.data();
                            const networkGroup = new NetworkGroup(this.db, network.name, network.timestamp, network.members);
                            // networkGroups.push(networkGroup);
                            this.queryUserProfileFromId(networkGroup);
                        }
                    }
                    // this.setState({networkGroups});
                }
            });
    }

    queryUserProfileFromId(group) {
        /**
         * Queries the Firestore for a user's profile given their uid.
         */
        const networkGroups = this.state.networkGroups;
        for (const uid of group.getMembers()) {
            this.db.collection(DbConstants.USERS)
                .doc(uid)
                .collection(DbConstants.PROFILE).get()
                .then(doc => {
                    if (doc.empty) {
                        // TODO: Display error to user
                        console.error('No user profile found!');
                    } else {
                        const prof = doc.docs[0].data();
                        const networkUser = new UserProfile(prof.firstName, prof.lastName, prof.email, prof.uid, null);
                        group.addUser(networkUser);
                    }
                });
        }
        networkGroups.push(group);
        this.setState({networkGroups});
    }

    setActiveTab(event) {
        /**
         * Called when the user clicks one of the tabs at the top of the page (Calendar, Profile, Networks)
         * and is used to change which page is currently displayed.
         */
        const id = event.target.id;

        if (id === Pages.CALENDAR) {
            this.setState({currentTab: Pages.CALENDAR});
        } else if (id === Pages.NETWORKS) {
            this.setState({currentTab: Pages.NETWORKS});
        } else if (id === Pages.PROFILE) {
            this.setState({currentTab: Pages.PROFILE});
        }
    }

    render() {
        if (!this.user) {
            return (  // Redirect back to login page if no user is authenticated
                <Redirect to={'/'}/>
            );
        }

        let currentPage = (<h3>Loading...</h3>);
        if (this.state.currentTab === Pages.CALENDAR) {
            currentPage = (<Calendar uid={this.user.uid} userProfile={this.state.userProfile} db={this.db}/>);
        } else if (this.state.currentTab === Pages.NETWORKS) {
            currentPage = (<Networks userProfile={this.state.userProfile} networkGroups={this.state.networkGroups}/>);
        } else if (this.state.currentTab === Pages.PROFILE && this.state.userProfile) {
            currentPage = (<Profile userProfile={this.state.userProfile}/>);
        }

        const classCalendar = (this.state.currentTab === Pages.CALENDAR) ? 'btn-home btn-open btn-active-tab' : 'btn-home btn-open';
        const classNetworks = (this.state.currentTab === Pages.NETWORKS) ? 'btn-home btn-open btn-active-tab' : 'btn-home btn-open';
        const classProfile = (this.state.currentTab === Pages.PROFILE) ? 'btn-home btn-open btn-active-tab' : 'btn-home btn-open';

        return (
            <div>
                <div className={'header'}>
                    <div className={'container-logo'}>
                        <img className={'logo'} src={logo} alt={'logo'}/>
                    </div>
                    <h1 id={'title'}>calendays</h1>
                </div>
                <div className={'page'}>
                    <NavBar/>
                    <div className={'contents'}>
                        <div className={'content-btns'}>
                            <button id={'my-calendar'} className={classCalendar} onClick={this.setActiveTab}>my calendar</button>
                            <button id={'my-networks'} className={classNetworks} onClick={this.setActiveTab}>my networks</button>
                            <button id={'my-profile'} className={classProfile} onClick={this.setActiveTab}>my profile</button>
                        </div>
                        {currentPage}
                    </div>
                </div>
            </div>
        );
    }
}

class NavBar extends Component {
    render() {
        const date = new Date();  // The current date to render at bottom of side nav
        this.monthNames = MonthNames;  // Array containing the months

        return (
            <div className={'navbar'}>
                <div className={'nav-btn-container'}>
                    <div style={{'marginTop': '20px'}}>
                        <img className={'logo'} src={notification} alt={'notification'}/>
                    </div>
                    <div style={{'marginTop': '20px'}}>
                        <img className={'logo'} src={profile} alt={'profile'}/>
                    </div>
                </div>
                <div className={'nav-today-container'}>

                    <div className={'nav-today-header'}>
                        <div className={'flex-centered'}>
                            today
                        </div>
                    </div>

                    <div className={'nav-date-container'}>
                        <div className={'flex-centered'}>
                            <div className={'nav-month'}>
                                {this.monthNames[date.getMonth()].substring(0, 3).toUpperCase()}
                            </div>
                            <div className={'nav-day'}>
                                {date.getDate()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Home;
