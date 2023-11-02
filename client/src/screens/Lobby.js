import { useState ,useCallback , useEffect } from "react"
import React from 'react'
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import './Lobby.css'
import logo from '../asset/logo.jpg'


const Lobby = () => {

  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');

  const socket = useSocket();
  const navigate = useNavigate();


  console.log(socket)

  // ============================================================
  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit('room:join',{email,room}) // now we will handle 'room:join' event in backend
    },
    [email,room,socket]
  );

  // ============================================================

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);

    },
    [navigate]
  );

  // ==============================================================


  useEffect(() => {
    socket.on("room:join",handleJoinRoom);
    return ()=>{
      socket.off('room:join',handleJoinRoom);
    }
  }, [socket,handleJoinRoom]);


  return (
    <div>
        <div class="container-login"> 
        
        <div class="wrap-login"> 
        
          <form onSubmit={handleSubmitForm}> 

          
            <span class="login-form-title">Welcome to CallJet</span>
            <h5 style={{textAlign:'center'}}>A world of collaboration, a click away</h5> 
            <br />
            
            <img class="avatar"src={logo} alt="" align="center"/>
          
            <div class="wrap-input100"> 
           
            <input class="input100" type="email" name="" id="email" placeholder="Enter Email id" value={email} onChange={(e)=>setEmail(e.target.value)} />
              <span class="focus-efecto"></span> 
            </div> 
          
            <div class="wrap-input100"> 
            
              <input class="input100" type="text" name="" id="room" placeholder="Enter Room number"  value={room} onChange={(e)=>setRoom(e.target.value)}/>
              <span class="focus-efecto"></span> 
            </div> 
          
            <div class="container-login-form-btn"> 
              <div class="wrap-login-form-btn"> 
                <div class="login-form-bgbtn"></div> 
                <button type="submit"  class="login-form-btn">Join </button> 
              </div> 
            </div> 
          </form> 
        </div> 
        
        </div>




    </div> 

     
  )
}

export default Lobby


// <form onSubmit={handleSubmitForm}>
// <label htmlFor="email">Email Id</label>
// <input type="email" name="" id="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
// <br />
// <label htmlFor="room">Room Number</label>
// <input type="text" name="" id="room" value={room} onChange={(e)=>setRoom(e.target.value)}/>
// <br />

// <button type="submit">Join</button>
// </form>