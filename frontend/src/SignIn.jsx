import { useState } from 'react'
import {apiurl} from "./constants.js"
import './App.css'


function App() {
    console.log("sign in page");

  //const [count, setCount] = useState(0)
    const LogIn = ()=>{
        window.location = "/#/boardgames";
    }

    window.onload = function () {
        // This function will run every time the page gets loaded.
        fetchData();
    }

    function fetchData() {
        fetch('/load', {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            if (!response.ok) {
                handleBadLoadResponse();
            } else {
                return response.json();
            }
        }).then(data => {
            // The way I have it in the server, I append the user's username to the first part of the array
            // so I pop it off here.
            const user = data.pop();
            greetUser(user['username']);
            showUserData(data);
        });
    }


    function handleBadLoadResponse() {
        alert("Failed to load data!");
    }


    function greetUser(user) {
        document.getElementById("user").innerText = `Hello, ${user}!`;
    }


    function showUserData(data) {
        document.getElementById("out").innerText = JSON.stringify(data);
    }


  return (
      <>
          <a href={apiurl+"/auth/github"}><button className="bg-Violet text-LightTeal w-50">Login with GitHub</button></a>
          <br/><br/>
          <button className="bg-LightTeal text-Violet w-50" onClick={LogIn}>Continue as guest</button>
      </>
  )
}

export default App
