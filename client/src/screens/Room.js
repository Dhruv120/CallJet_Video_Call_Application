import { useState ,useCallback , useEffect } from "react"
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import peer from "../services/peer";
import './Room.css'
import ReactPlayer from 'react-player'
import camera from '../icons/camera.png'
import mic from '../icons/mic.png'
import phone from '../icons/phone.png'
import logo from '../asset/logo.jpg'

const Room = () => {

    const socket = useSocket();
  const navigate = useNavigate();

    const [Me, setMe] = useState('');
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();
    const [anotherUser, setanotherUser] = useState('')
    

// =========================================================================

    const handleUserJoined = useCallback(({ email, id }) => {
        console.log(`Email ${email} joined room`);
        setanotherUser(email);
        setRemoteSocketId(id);
      }, []);

 //===========================================================================   

      const handleCallUser = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        const offer = await peer.getOffer(); // we will send this to other user
        socket.emit("user:call", { to: remoteSocketId, offer }); // sending offer to other user
       
        setMyStream(stream);

      }, [remoteSocketId,socket]);

 //===========================================================================   

 const handleIncommingCall = useCallback(async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );


//   ========================================================================

    const sendStreams = useCallback(() => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream]);

 //===========================================================================   

    const handleCallAccepted = useCallback(({ from, ans }) => {
        peer.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams();
        },
        [sendStreams]
    );

// ======================================================================

const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

// =======================================================================


    const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }) => {
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );

//   ======================================================================

    const handleNegoNeedFinal = useCallback(async ({ ans }) => {
        await peer.setLocalDescription(ans);
    }, []);

//=========================================================================== 

    useEffect(() => {
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
            return () => {
                 peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
            };
    }, [handleNegoNeeded]);

//   =====================================================================

    useEffect(() => {
        peer.peer.addEventListener("track", async (ev) => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!");
            setRemoteStream(remoteStream[0]);
        });
    }, []);


// =============================================================================

let toggleCamera = async () =>{
  let videoTrack = myStream.getTracks().find(track => track.kind === 'video')
  
  if(videoTrack.enabled)
  {
    videoTrack.enabled = false;
    document.getElementById('camera-btn').style.backgroundColor='rgb(255,80,80)'
  }
  else{
    videoTrack.enabled = true;
    document.getElementById('camera-btn').style.backgroundColor='rgb(179,102,250)'
  }
}

// ======================================================================

let togglemike = async () =>{
  let audioTrack = myStream.getTracks().find(track => track.kind === 'audio')
  
  if(audioTrack.enabled)
  {
    audioTrack.enabled = false;
    document.getElementById('mice-btn').style.backgroundColor='rgb(255,80,80)'
  }
  else{
    audioTrack.enabled = true;
    document.getElementById('mice-btn').style.backgroundColor='rgb(179,102,250)'
  }
}



// ================================================================================

const handleExit = () =>
{
    let videoTrack = myStream.getTracks().find(track => track.kind === 'video')
    let audioTrack = myStream.getTracks().find(track => track.kind === 'audio')

    if(videoTrack.enabled)
    {
       videoTrack.enabled = false;
    }

    if(audioTrack.enabled)
    {
      audioTrack.enabled = false;
    }

    navigate('/');
}

// ================================================================================
      useEffect(() => {
            socket.on('user:joined',handleUserJoined)
            socket.on("incomming:call", handleIncommingCall);
            socket.on("call:accepted", handleCallAccepted);
            socket.on("peer:nego:needed", handleNegoNeedIncomming);
            socket.on("peer:nego:final", handleNegoNeedFinal);


            return ()=>{
                socket.off('user:joined',handleUserJoined);
                socket.off("incomming:call", handleIncommingCall);
                socket.off("call:accepted", handleCallAccepted);
                socket.off("peer:nego:needed", handleNegoNeedIncomming);
                socket.off("peer:nego:final", handleNegoNeedFinal);
            }

      }, [socket,handleUserJoined,handleIncommingCall,handleCallAccepted,handleNegoNeedIncomming,handleNegoNeedFinal])


  return (
    <div>
    
    <nav class="navbar navbar-light mynav" >
    <div class="navbar-brand" style={{display:'flex', justifyContent:'center',alignItems:'center'}}>
      <div style={{color:'white' , paddingLeft:'30px',}}>
          <img src={logo} style={{borderRadius:"50%"}} width="40" height="40" alt=""/>
      </div>
      <div>
          <h3 style={{color:'white' , paddingLeft:'20px',letterSpacing:2}}>CallJet</h3>
      </div>
    </div>
  </nav>


    <div className="roomBgrd">


 
   { /*  <h1 className="topheader">You have Entered the Room</h1> */}
    {/*  <h3 className="subHeader">{remoteSocketId ? `${anotherUser} has joined the room` : "No one in room"}</h3> */}
   
<br />
    <div className="btncont">

      <div className="btnbox">
        {
          remoteSocketId ? 
                <button className="btn btn-primary" onClick={handleCallUser}>Call The Person in Room</button>:''
        }
      </div>

      <div className="btnbox">
          {
            myStream &&  <button className="btn btn-primary" onClick={sendStreams}>Accept Call</button>
          }
      </div>
     
    </div>

      
    <div className="videocont">
          <div className="videobox">
              {myStream && (
                <div>
                  
                  <ReactPlayer
                    playing
                    muted
                    height="400px"
                    width="700px"
                    url={myStream}
                  />
                  <div className="persondiv">You</div>
                </div>
              )}

          </div>

          <div className="videobox">
              {remoteStream && (
                <div>
                  
                  <ReactPlayer
                    playing
                    muted
                    height="400px"
                    width="700px"
                    url={remoteStream}
                  />
                  <div className="persondiv">{anotherUser}</div>
                </div>
              )}
          </div>
    
    </div>
<br />
    
{
  myStream &&
  <div className="control">

            <div className="control-container" id='camera-btn' onClick={toggleCamera}>
                  <img src={camera} width='30px'  alt="" />
            </div>
    
            <div className="control-container" id='mice-btn'>
                  <img src={mic} width='30px' onClick={togglemike} alt="" />
            </div>

    
            <div className="control-container" id='quit-btn' onClick={handleExit}>
                  <img src={phone} width='30px' alt="" />
            </div>
        
        </div>
}
        
    
        
      
         
    
    </div>
    </div>
  )
}

export default Room