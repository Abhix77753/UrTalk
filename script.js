const socket = io();
let localStream, peerConnection;
const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

// UI Elements
const landing = document.getElementById("landing");
const textChat = document.getElementById("textChat");
const videoChat = document.getElementById("videoChat");
const textBtn = document.getElementById("textBtn");
const videoBtn = document.getElementById("videoBtn");
const backBtns = document.querySelectorAll(".backBtn");

// Text chat
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");

// Video chat
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const startBtn = document.getElementById("startBtn");

// Switch to text
textBtn.onclick = () => {
  landing.classList.add("hidden");
  textChat.classList.remove("hidden");
};

// Switch to video
videoBtn.onclick = () => {
  landing.classList.add("hidden");
  videoChat.classList.remove("hidden");
};

// Back buttons
backBtns.forEach(btn => {
  btn.onclick = () => {
    textChat.classList.add("hidden");
    videoChat.classList.add("hidden");
    landing.classList.remove("hidden");
  };
});

// Messaging
sendBtn.onclick = () => {
  const msg = msgInput.value;
  if (msg) {
    socket.emit("chat", msg);
    appendMsg("You", msg);
    msgInput.value = "";
  }
};
socket.on("chat", msg => appendMsg("Stranger", msg));

function appendMsg(sender, text) {
  const div = document.createElement("div");
  div.innerHTML = `<b>${sender}:</b> ${text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Video Chat
startBtn.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  peerConnection = new RTCPeerConnection(servers);
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = event => {
    if (event.candidate) socket.emit("candidate", event.candidate);
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", offer);
};

socket.on("offer", async offer => {
  peerConnection = new RTCPeerConnection(servers);
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) socket.emit("candidate", event.candidate);
  };

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answer", answer);
});

socket.on("answer", answer => {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});
socket.on("candidate", candidate => {
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});