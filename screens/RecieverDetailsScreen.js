
import React ,{Component} from 'react';
import {View,Text,StyleSheet,TouchableOpacity} from 'react-native';
import{Card,Header,Icon} from 'react-native-elements';
import firebase from 'firebase';

import db from '../config.js';

export default class RecieverDetailsScreen extends Component{
  constructor(props){
    super(props);
    this.state={
      userId                    : firebase.auth().currentUser.email,
      userName                  : "",
      recieverId                : this.props.navigation.getParam('details')["UserID"],
      requestId                 : this.props.navigation.getParam('details')["RequestID"],
      bookName                  : this.props.navigation.getParam('details')["BookName"],
      reason_for_requesting     : this.props.navigation.getParam('details')["ReasonForRequest"],
      recieverName              : '',
      recieverContact           : '',
      recieverAddress           : '',
      recieverRequestDocId      : ''
    }
  }



  getRecieverDetails(){
    db.collection('Users').where('emailAdress','==',this.state.recieverId).get()
    .then(snapshot=>{
      snapshot.forEach(doc=>{
        this.setState({
          recieverName    : doc.data().firstName,
          recieverContact : doc.data().Contact,
          recieverAddress : doc.data().address,
        })
      })
    });

    db.collection('BookRequests').where('RequestID','==',this.state.requestId).get()
    .then(snapshot=>{
      snapshot.forEach(doc => {
        this.setState({recieverRequestDocId:doc.id})
     })
  })}


  getUserDetails=(userId)=>{
    db.collection("Users").where('emailAdress','==', userId).get()
    .then((snapshot)=>{
      snapshot.forEach((doc) => {
        this.setState({
          userName  :doc.data().firstName + " " + doc.data().lastName
        })
      })
    })
  }

  updateBookStatus=()=>{
    db.collection('allDonations').add({
      "BookName"           : this.state.bookName,
      "RequestID"          : this.state.requestId,
      "RequestedBy"        : this.state.recieverName,
      "DonorID"            : this.state.userId,
      "RequestStatus"      :  "Donor Interested"
    })
  }


  addNotification=()=>{
    var Message = this.state.userName + " has shown interest in donating the book"
    db.collection("allNotifications").add({
      "targetedUserID"    : this.state.recieverId,
      "DonorID"            : this.state.userId,
      "RequestID"          : this.state.requestId,
      "BookName"           : this.state.bookName,
      "date"                : firebase.firestore.FieldValue.serverTimestamp(),
      "notificationStatus" : "unread",
      "Message"             : Message
    })
  }



  componentDidMount(){
    this.getRecieverDetails()
    this.getUserDetails(this.state.userId)
  }


    render(){
      return(
        <View style={styles.container}>
          <View style={{flex:0.1}}>
            <Header
              leftComponent ={<Icon name='arrow-left' type='feather' color='#696969'  onPress={() => this.props.navigation.goBack()}/>}
              centerComponent={{ text:"Donate Books", style: { color: '#90A5A9', fontSize:20,fontWeight:"bold", } }}
              backgroundColor = "#eaf8fe"
            />
          </View>
          <View style={{flex:0.3}}>
            <Card
                title={"Book Information"}
                titleStyle= {{fontSize : 20}}
              >
              <Card >
                <Text style={{fontWeight:'bold'}}>Name : {this.state.bookName}</Text>
              </Card>
              <Card>
                <Text style={{fontWeight:'bold'}}>Reason : {this.state.reason_for_requesting}</Text>
              </Card>
            </Card>
          </View>
          <View style={{flex:0.3}}>
            <Card
              title={"Reciever Information"}
              titleStyle= {{fontSize : 20}}
              >
              <Card>
                <Text style={{fontWeight:'bold'}}>Name: {this.state.recieverName}</Text>
              </Card>
              <Card>
                <Text style={{fontWeight:'bold'}}>Contact: {this.state.recieverContact}</Text>
              </Card>
              <Card>
                <Text style={{fontWeight:'bold'}}>Address: {this.state.recieverAddress}</Text>
              </Card>
            </Card>
          </View>
          <View style={styles.buttonContainer}>
            {
              this.state.recieverId !== this.state.userId
              ?(
                <TouchableOpacity
                    style={styles.button}
                    onPress={()=>{
                      this.updateBookStatus()
                      this.addNotification()
                      this.props.navigation.navigate('MyDonations')
                    }}>
                  <Text>I want to Donate</Text>
                </TouchableOpacity>
              )
              : null
            }
          </View>
        </View>
      )
    }

}


const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  buttonContainer : {
    flex:0.3,
    justifyContent:'center',
    alignItems:'center'
  },
  button:{
    width:200,
    height:50,
    justifyContent:'center',
    alignItems : 'center',
    borderRadius: 10,
    backgroundColor: 'orange',
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8
     },
    elevation : 16
  }
})
