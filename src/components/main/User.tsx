import React, {Component} from 'react';
import '../../css/main/User.scss';
import Networks from '../networks/Networks';
import {UserProfile} from '../../data/UserProfile';
import {NetworkGroup} from '../../data/NetworkGroup';
import {NetworkEvent} from '../../data/NetworkEvent';
import {Profile} from '../profile/Profile';
import {Redirect} from 'react-router';

const UserPages = {  // The main tabs that a user can view; the value is the 'id' of the tab <button>
    NETWORKS: 'my-networks',
    PROFILE: 'my-profile'
};

interface UserProps {
    firebase: any;
    userProfile: null | UserProfile;
    events: null | NetworkEvent[];
    networkGroups: NetworkGroup[];
    handleNewEvent: (event: any) => void;
    onAddUserNetwork: (networkGroup: NetworkGroup) => void;
    personalNetworkId: number;
}

interface UserState {
    currentTab: string;
    signedOut: boolean
}

export class User extends Component<UserProps, UserState> {
    constructor(props: UserProps) {
        super(props);

        this.state = {
            currentTab: UserPages.NETWORKS,  // The active tab selected by the user (this is the starting tab)
            signedOut: false
        };

        this.setActiveTab = this.setActiveTab.bind(this);
        this.signOut = this.signOut.bind(this);
    }

    setActiveTab(event: React.MouseEvent<HTMLElement>) {
        /**
         * Called when the user clicks one of the tabs at the top of the page (Calendar, Profile, Networks)
         * and is used to change which page is currently displayed.
         */
        event.preventDefault();
        const id = event.currentTarget.id;
        if (id === UserPages.NETWORKS) {
            this.setState({currentTab: UserPages.NETWORKS});
        } else if (id === UserPages.PROFILE) {
            this.setState({currentTab: UserPages.PROFILE});
        }
    }

    signOut() {
        this.props.firebase.auth().signOut().then(() => {
            this.setState({signedOut: true});
            console.log('(US01) Successfully signed out');
        }).catch((error: any) => {
            console.error('(UE01) Failed to sign out!');
        })
    }

    render() {
        if (this.state.signedOut) {
            return (<Redirect to={'/login'}/>)
        }

        let currentPage = (<h3>Loading...</h3>);
        if (this.state.currentTab === UserPages.NETWORKS) {
            currentPage = (<Networks userProfile={this.props.userProfile}
                                     networkGroups={this.props.networkGroups}
                                     addNewNetwork={this.props.onAddUserNetwork}/>);
        } else if (this.state.currentTab === UserPages.PROFILE && this.props.userProfile) {
            currentPage = (<Profile userProfile={this.props.userProfile}/>);
        }

        const classNetworks = (this.state.currentTab === UserPages.NETWORKS) ? 'btn-flat btn-flat-active' : 'btn-flat';
        const classProfile = (this.state.currentTab === UserPages.PROFILE) ? 'btn-flat btn-flat-active' : 'btn-flat';

        return (
            <div className={'user-container'}>
                <div className={'content-btns'}>
                    <button id={'my-networks'} className={classNetworks} onClick={this.setActiveTab}>
                        my networks
                    </button>
                    <button id={'my-profile'} className={classProfile} onClick={this.setActiveTab}>
                        my profile
                    </button>
                    <button id={'sign-out'} className={'btn-flat'} onClick={this.signOut}>
                        sign out
                    </button>
                    <div className={'line'}/>
                </div>
                <div className={'user-content'}>
                    {currentPage}
                </div>
            </div>
        );
    }
}
