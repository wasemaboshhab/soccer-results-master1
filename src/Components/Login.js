import {sendApiGetRequest, sendApiPostRequest} from "./AppResponse";

import React from "react";
import axios from "axios";
import liveMatches from "./LiveMatches";
import Tables from "./Tables";
import RenderGame from "./RenderGame";
class Login extends  React.Component {
    state= {
        username: "",
        password: "",
        responseFromGetRequest: "",
        responseFromPostRequest: "",
        errorMessage: "",
        userExist: false,
        clubs: [],
        renderOption: false,
        option1: "",
        option2: "",
        groupOneGoals: 0,
        groupTwoGoals: 0,
        isClicked: false,
        liveMatches: [],
        optionEdit: ""
    }
    addUserName = (e) => {
        this.setState({
            username: e.target.value
        })
    }
    addUserPassword = (e) => {
        this.setState({
            password: e.target.value
        })
        console.log(this.state)

    }
    finishMatch = (team1,isAlive) =>{
        sendApiPostRequest("http://localhost:8989/finish-match",
            {
                team1: team1,
                isLive: isAlive,
            }, (response) => {
                if (response.data.isLive === false) {
                    alert("match finished");
                }
            });
        // rest goals:


    }
    componentDidMount() {
        sendApiGetRequest("http://localhost:8989/get-groups" , (res)=>{
            this.setState({
                clubs: res.data,
            })
        })
    };
    signInRequest=()=> {
        sendApiPostRequest("http://localhost:8989/sign-in", {
            username:this.state.username,
            password:this.state.password
        }, (response) => {
            if (response.data.success) {
                this.setState({
                    username: response.data.user.username,
                    userExist: true,
                    renderOption: true
                })
                alert("sign in successfully!");

            } else {
                if (response.data.errorCode === 1) {
                    this.setState({
                        errorMessage: "No Such User"
                    })
                } else if (response.data.errorCode === 2) {
                    this.setState({
                        errorMessage: "Password Incorrect"
                    })

                }
            }

        })
        if(this.state.errorMessage !== ""){
            alert(this.state.errorMessage)
        }
    }
    saveMatch = () => {

        sendApiPostRequest("http://localhost:8989/save-match", {
            team1: this.state.option1,
            team2: this.state.option2,
            isLive: true,
        }, (response) => {
            if (response.data.success) {
                this.setState({
                    isClicked: true
                })
                alert("Game saved!");}
            else if(response.data.errorCode === 1)
                alert("One of the teams is already playing, please choose a different one!");
        })
        sendApiGetRequest("http://localhost:8989/get-live-games" , (res)=>{
            this.setState({
                liveMatches: res.data,
            })
        })
    }
    selectedGroup1 = () => {
        let option1 = document.getElementById("option1");
        let text1 = option1.options[option1.selectedIndex].text;
        this.setState({
            option1: text1,
        })
    }
    selectedGroup2 = () => {
        let option2 = document.getElementById("option2");
        let text2 = option2.options[option2.selectedIndex].text;

        this.setState({
            option2: text2
        })
    }

    addScoredGoals = (goalsA, team1) =>  {
        let array=[...this.state.liveMatches]
       array.map(team=>{
           if (team.team1===team1){
               debugger
               team.team1Goals
                   +=goalsA;
           }
       })
        this.setState({
            liveMatches:array
        })
        // let counter = this.state.groupOneGoals;
        // let counter2 = this.state.groupTwoGoals;
        //
        // this.setState({
        //     groupOneGoals: counter+1,
        //     groupTwoGoals:counter2+1
        // })

        sendApiPostRequest("http://localhost:8989/update-team1-goals", {
            team1: team1,
            team1Goals: goalsA
        }, (response) => {
            if (response.data) {
                alert("goal Added!");
            }
        })
    }

    addGoalsGroupTwo = (goalsB,team2) => {
        let array=[...this.state.liveMatches]
        array.map(team=>{
            if (team.team2===team2){
                debugger
                team.team2Goals
                    +=goalsB;
            }
        })
        this.setState({
            liveMatches:array
        })
        sendApiPostRequest("http://localhost:8989/update-team2-goals", {
            team2: team2,
            team2Goals: goalsB
        }, (response) => {

            if (response.data) {
                alert("goal Added!");
            }
        })
    }

    replay (id){

    }


    login = () => {
        return (
            <div>
                <div className={"login"}>
                    <input type="text" value={this.state.username} onChange={this.addUserName}
                           placeholder={"username"}/>
                    <br/>
                    <input type="password" value={this.state.password} onChange={this.addUserPassword}
                           placeholder={"password"}/>
                    <br/>
                </div>
                <button type="login" onClick={this.signInRequest} disabled={this.state.userExist}>Login</button>

            </div>

        )
    }
    render(){
        {
            return (

                this.state.renderOption ?
                    <div>
                        <div id={"group1"}>
                            Group 1
                            <br/>
                            <select id={"option1"} onChange={this.selectedGroup1}>
                                <option value="">-Please choose a group-</option>
                                {
                                    this.state.clubs.map((team,i) => {
                                        let disabled = team.name === this.state.option2
                                        return (
                                            <option value={i} disabled={disabled}>{team.name}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div id={"group2"}>
                            <br/>
                            <br/>
                            Group 2
                            <br/>
                            <select id={"option2"} onChange={this.selectedGroup2}>
                                <option value="">-Please choose a group-</option>
                                {
                                    this.state.clubs.map((team,i) => {
                                        let disabled = team.name === this.state.option1
                                        return (
                                            <option value={i} disabled={disabled}>{team.name}</option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <button onClick={this.saveMatch}
                                disabled={this.state.groupOneGoals !== 0 || this.state.groupTwoGoals !== 0}>save
                        </button>
                        {this.state.isClicked ?
                            <div>
                                {this.state.liveMatches.map((match)=>{
                                    return(
                                        <div>
                                            <RenderGame match = {match}  addGoals1={this.addScoredGoals}
                                                        addGoals2={this.addGoalsGroupTwo}
                                                         finish={this.finishMatch}/>
                                        </div>
                                    )
                                })}

                            </div>
                            : ""
                        }
                        <br/>
                        {/*<button onClick={this.finishMatch}*/}
                        {/*    // end match = rest the goals and the selects options*/}
                        {/*        disabled={this.state.option1.selected && this.state.option2.selected}>End Game*/}
                        {/*</button>*/}

                    </div>
                    : this.login()
            );
        }
    }
}
export default Login;