import React, { useState, useEffect } from 'react';
import {
    useHistory,
    useParams
  } from "react-router-dom";
import {
    Container, 
    Row, 
    Col,
    Card,
    CardBody,
    CardSubtitle,
    Button,
    Form,
    InputGroup,
    Input,
    InputGroupAddon,
} from 'reactstrap';
import Moment from 'moment';
import ScrollToBottom from 'react-scroll-to-bottom';
import Upload from './Upload';
import {storage, db} from '../Firebase';

import '../Styles.css';

function ChatRoom() {
    const [chats, setChats] = useState([]);
    const [users, setUsers] = useState([]);
    const [nickname, setNickname] = useState('');
    const [image , setImage] = useState('');
    const [roomname, setRoomname] = useState('');
    const [newchat, setNewchat] = useState({ roomname: '', nickname: '', message: '', date: '', type: '', imageURL:'' });
    const history = useHistory();
    const { room } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            setNickname(localStorage.getItem('nickname'));
            setRoomname(room);
            db.ref('chats/').orderByChild('roomname').equalTo(roomname).on('value', resp => {
              setChats(snapshotToArray(resp));
            });
        };
      
        fetchData();
    }, [room, roomname]);

    useEffect(() => {
        const fetchData = async () => {
            setNickname(localStorage.getItem('nickname'));
            setRoomname(room);
            db.ref('roomusers/').orderByChild('roomname').equalTo(roomname).on('value', (resp2) => {
              setUsers([]);
              const roomusers = snapshotToArray(resp2);
              setUsers(roomusers.filter(x => x.status === 'online'));
            });
        };
      
        fetchData();
    }, [room, roomname]);

    const snapshotToArray = (snapshot) => {
        const returnArr = [];

        snapshot.forEach((childSnapshot) => {
            const item = childSnapshot.val();
            item.key = childSnapshot.key;
            returnArr.push(item);
        });

        return returnArr;
    }

    const submitMessage = (e) => {
        e.preventDefault();
        const chat = newchat;
        chat.roomname = roomname;
        chat.nickname = nickname;
        chat.date = Moment(new Date()).format('DD/MM/YYYY HH:mm:ss');
        chat.type = 'message';

        if(image) {
            
            let timeStampInMs = window.performance && window.performance.now && window.performance.timing && window.performance.timing.navigationStart ? window.performance.now() + window.performance.timing.navigationStart : Date.now();
           
            storage.ref(`/images/${timeStampInMs}${image.name}`).put(image)
                  .then(()=>{
                    storage.ref(`/images/${timeStampInMs}${image.name}`).getDownloadURL().then((imageURL)=>{
                      uploadImage(imageURL)
                      
                    });
                  });
                 
        }else{
            const newMessage = db.ref('chats/').push();
            newMessage.set(chat);
            setNewchat({ roomname: '', nickname: '', message: '', date: '', type: '', imageURL:'' });
        }


        
    };

    const uploadImage = (imageURL) => {
        const chat = JSON.parse(JSON.stringify(newchat));
        chat.roomname = roomname;
        chat.nickname = nickname;
        chat.date = Moment(new Date()).format('DD/MM/YYYY HH:mm:ss');
        chat.type = 'image';
        chat.imageURL = imageURL;
        const newMessage = db.ref('chats/').push();
        newMessage.set(chat);
        setImage('');
        // setNewchat({...newchat, message: ''})
        
    }

    const onChange = (e) => {
        e.persist();
        setNewchat({...newchat, [e.target.name]: e.target.value});
    }

    const exitChat = (e) => {
        const chat = { roomname: '', nickname: '', message: '', date: '', type: '' };
        chat.roomname = roomname;
        chat.nickname = nickname;
      //  chat.date = Moment(new Date()).format('DD/MM/YYYY HH:mm:ss');
       // chat.message = `${nickname} leave the room`;
        chat.type = 'exit';
        const newMessage = db.ref('chats/').push();
        newMessage.set(chat);
    
        db.ref('roomusers/').orderByChild('roomname').equalTo(roomname).once('value', (resp) => {
          let roomuser = [];
          roomuser = snapshotToArray(resp);
          const user = roomuser.find(x => x.nickname === nickname);
          if (user !== undefined) {
            const userRef = db.ref('roomusers/' + user.key);
            userRef.update({status: 'offline'});
          }
        });
    
        history.goBack();
    }

  
    const handleImageChange = (file) => {
        setImage(file)

        if(newchat.imageURL){
            newchat.imageURL = '';
            setNewchat(newchat);
        }
    }
    

    return (
        <div className="Container">
                 
            <Container>
                <Row>
                    <Col sm="2" md="4">
                        <div>
                            <Card className="UsersCard">
                                <CardBody>
                                    <CardSubtitle>
                                    <h5> {roomname}</h5>
                                        <Button variant="primary" type="button" onClick={() => { exitChat() }}>
                                            Exit Chat
                                        </Button>
                                    </CardSubtitle>
                                </CardBody>
                            </Card>
                            {users.map((item, idx) => (
                                <Card key={idx} className="UsersCard">
                                    <CardBody>
                                        <CardSubtitle>{item.nickname}</CardSubtitle>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </Col>
                    <Col>
                        <ScrollToBottom className="ChatContent">
                            {chats.map((item, idx) => (
                                <div key={idx} className="MessageBox">
                                    {item.type ==='join'||item.type === 'exit'?
                                        <div className="ChatStatus">
                                            <span className="ChatDate">{item.date}</span>
                                            <span className="ChatContentCenter">{item.message}</span>
                                        </div>:
                                        <div className="ChatMessage">
                                            <div className={`${item.nickname === nickname? "RightBubble":"LeftBubble"}`}>
                                                {item.nickname === nickname ? 
                                                    <span className="MsgName">Me</span>:<span className="MsgName">{item.nickname}</span>
                                                }
                                                <span className="MsgDate"> at {item.date}</span>
                                                    {item.type  === 'image' ?
                                                    (<div className='image-container'> <img src = {item.imageURL} alt= 'picture' /></div>) 
                                                    : <p>{item.message}</p>}
                                           
                                            </div>
                                        </div>
                                    }
                                </div>
                            ))}
                        </ScrollToBottom>
                        <footer className="StickyFooter">
                            <Form  onSubmit={submitMessage}>
                                <InputGroup>
                                    <Input type="text" name="message" id="message" placeholder="Enter message here" value={newchat.message} onChange={onChange} />
                                    <Upload 
                                        uploadImage = { uploadImage }
                                        setImage = { handleImageChange } />
                                    <>
                                        <Button variant="primary" type="submit">Send</Button>
                                    </>
                                </InputGroup>
                            </Form>
                        </footer>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default ChatRoom;