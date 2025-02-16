import { useState } from 'react'
import './App.css'
import {apiurl} from "./constants.js";
import ResultsTable from "./ResultsTable.jsx";



function App() {
    console.log("form page");
    let appdata = [];

    let defaultUsername = "guest";
    let username = defaultUsername;
    const GetUsername = async function(){
        const response = await fetch( apiurl+"/getuser", {
            method:'POST'
        })

        const text = await response.text()
        if(username === defaultUsername){username=text; console.log("setting username for the first time")}
        else{console.log("setting username twice for some reason")}
        console.log(username)
    }

    GetUsername();

    const table=<ResultsTable data={appdata}/>

    const submit = async function( event ) {
        if(event !== 0) {
            event.preventDefault()
        }

        const nameInput = document.querySelector( "#name" ),
            introInput = document.querySelector( "#intro" ),
            wingspanInput = document.querySelector( "#wingspan" ),
            catanInput = document.querySelector( "#catan" ),
            tickettorideInput = document.querySelector( "#tickettoride" ),
            clankInput = document.querySelector( "#clank" ),
            //gamePlayedInput = document.querySelector('input[name="game_played"]:checked'),
            gameTypeInput = document.querySelector('input[name="game_type"]:checked'),
            colorInput = document.querySelector( "#colors" );

        let json;

        if(event === 0){
            json = {username: username,name:""}
        }
        else {
            json = {
                username: username,
                name: nameInput.value,
                intro: introInput.value,
                gamePlayed: [wingspanInput.checked, catanInput.checked, tickettorideInput.checked, clankInput.checked],
                gameType: gameTypeInput.value,
                playerColor: colorInput.value
            };
        }
        const body = JSON.stringify( json );

        const response = await fetch( apiurl+"/submit", {
            method:'POST',
            body
        })

        const text = await response.text()
        console.log(text);
        appdata = JSON.parse(text);
        updateTable(appdata);
    }

    const deleteRow = async function( rowNum) {
        console.log( "deleteRow" );
        const rowID = {username: appdata[rowNum].username, name: appdata[rowNum].name };
        const body = JSON.stringify(rowID);
        const response = await fetch( apiurl+"/delete", {
            method:'POST',
            body
        })
        const text = await response.text()
        console.log(text);
        appdata = JSON.parse(text);
        updateTable();
    }

    const updateTable = function() {
        //changeTable(<ResultsTable data={appdata}/>);
        const resultsTable = document.getElementById("resultsTable");

        resultsTable.innerHTML = null;
        //resultsTable.innerHTML += "<thead><tr><th>Username</th><th>Name</th><th>Intro</th><th>Favorite Mechanic</th><th>Color</th><th>Games Played</th></tr></thead>";
        for (let i = 0; i < appdata.length; i++) {
            const namei = appdata[i].name;
            const introi = appdata[i].intro;
            const typei = appdata[i].gameType;
            const colori = appdata[i].playerColor;
            const numi = appdata[i].numGamesPlayed;

            const buttonID = "button" + i;
            //resultsTable.innerHTML += `<tr><th>${username}</th><th>${namei}</th><th>${introi}</th><th>${typei}</th><th>${colori}</th><th>${numi}</th><th><DeleteButton rowNum=${i} deleteRow=${deleteRow}/></th></tr>`;
            resultsTable.innerHTML += `<tr><th>${username}</th><th>${namei}</th><th>${introi}</th><th>${typei}</th><th>${colori}</th><th>${numi}</th>`+
                                        `<th><button id=${buttonID}>Delete</button></th></tr>`;

        }

        for(let i=0; i<appdata.length; i++){
            const buttonID = "button" + i;
            document.getElementById(buttonID).onclick = () => {deleteRow(i)};
        }
    }

    submit(0);


    return (
        <>
            <h1 className="font-bold text-Teal">Board Games</h1><br/>
            <form className="bg-Violet w-200 rounded-2xl p-3">

                <label className="text-lg text-Lilac" htmlFor="name">Name:</label><br/>
                <input className="bg-Lilac text-Violet p-1 rounded-sm" type="text" id="name" name="name"/><br/><br/>

                <label className="text-lg text-Lilac" htmlFor="intro">What board games do you like to play?</label><br/>

                <textarea className="bg-Lilac text-Violet p-1 rounded-sm" id="intro" name="intro" rows="4" cols="50">

                </textarea><br/><br/>

                <p className="text-lg text-Lilac">Which of these games have you played?</p>
                <input className="bg-Teal" type="checkbox" id="wingspan" name="game_played" value="WINGSPAN"/>
                <label className="text-lg text-Lilac" htmlFor="wingspan"> Wingspan</label><br/>
                <input type="checkbox" id="catan" name="game_played" value="CATAN"/>
                <label className="text-lg text-Lilac" htmlFor="catan"> Catan</label><br/>
                <input type="checkbox" id="tickettoride" name="game_played" value="TICKETTORIDE"/>
                <label className="text-lg text-Lilac" htmlFor="tickettoride"> Ticket to Ride</label><br/>
                <input type="checkbox" id="clank" name="game_played" value="CLANK"/>
                <label className="text-lg text-Lilac" htmlFor="clank"> Clank</label><br/><br/>

                <p className="text-lg text-Lilac">What is your favorite game mechanic?</p>
                <input type="radio" id="engine" name="game_type" value="EngineBuilding"/>
                <label className="text-lg text-Lilac" htmlFor="engine"> Engine building</label><br/>
                <input type="radio" id="worker" name="game_type" value="WorkerPlacement"/>
                <label className="text-lg text-Lilac" htmlFor="worker"> Worker placement</label><br/>
                <input type="radio" id="deck" name="game_type" value="Deckbuilding"/>
                <label className="text-lg text-Lilac" htmlFor="deck"> Deckbuilding</label><br/>
                <input type="radio" id="social" name="game_type" value="SocialDeduction"/>
                <label className="text-lg text-Lilac" htmlFor="social"> Social deduction</label><br/><br/>

                <label className="text-lg text-Lilac" htmlFor="colors">What color do you play as most often?</label><br/>

                <select className="text-lg text-Violet bg-LightTeal rounded-sm" name="colors" id="colors">
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="yellow">Yellow</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                </select><br/><br/>

                <button className="bg-LightTeal text-Violet" type="button" onClick={submit}>Submit</button>

            </form>
            <br/>
            <hr className="text-Teal bg-Teal w-full p-1 rounded-sm"/>
            <br/>
            <h1 className="font-bold text-Teal">Results</h1><br/>
            <section className="flex justify-center" id="resultsDisplay">
                {table}
            </section>
        </>
    )
}

export default App
