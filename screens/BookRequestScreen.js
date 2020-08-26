import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableHighlight,
  Alert} from 'react-native';
  import {BookSearch} from 'react-native-google-books';

  import db from '../config';
import firebase from 'firebase';
import MyHeader from '../components/MyHeader'
import { FlatList } from 'react-native-gesture-handler';

export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName:"",
      reasonToRequest:"",
      IsBookRequestActive : "",
      requestedBookName: "",
      bookStatus:"",
      requestId:"",
      userDocId: '',
      docId :''
    }
  }

  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }



  addRequest = async (bookName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    var book = await BookSearch.searchbook(bookName,'AIzaSyBm3HorF5uhRSlp8VoYVPx3JZhqMTig8WY')
    db.collection('BookRequests').add({
        "UserID": userId,
        "BookName":bookName,
        "ReasonForRequest":reasonToRequest,
        "RequestID"  : randomRequestId,
        "bookStatus" : "requested",
         "date"       : firebase.firestore.FieldValue.serverTimestamp(),
         "image_link" : books.data [0].volumeInfo.imageLinks.smallThumbnail,

    })

    await  this.getBookRequest()
    db.collection('Users').where("emailAdress","==",userId).get()
    .then()
    .then((snapshot)=>{
      snapshot.forEach((doc)=>{
        db.collection('Users').doc(doc.id).update({
      IsBookRequestActive: true
      })
    })
  })

    this.setState({
        bookName :'',
        reasonToRequest : '',
        requestId: randomRequestId
    })

    return Alert.alert("Book Requested Successfully")


  }

receivedBooks=(bookName)=>{
  var userId = this.state.userId
  var requestId = this.state.requestId
  db.collection('RecievedBooks').add({
      "UserID": userId,
      "BookName":bookName,
      "RequestID"  : requestId,
      "bookStatus"  : "received",

  })
}




getIsBookRequestActive(){
  db.collection('Users')
  .where('emailAdress','==',this.state.userId)
  .onSnapshot(querySnapshot => {
    querySnapshot.forEach(doc => {
      this.setState({
        IsBookRequestActive:doc.data().IsBookRequestActive,
        userDocId : doc.id
      })
    })
  })
}










getBookRequest =()=>{
  // getting the requested book
var bookRequest=  db.collection('BookRequests')
  .where('UserID','==',this.state.userId)
  .get()
  .then((snapshot)=>{
    snapshot.forEach((doc)=>{
      if(doc.data().bookStatus !== "received"){
        this.setState({
          requestId : doc.data().RequestID,
          requestedBookName: doc.data().BookName,
          bookStatus:doc.data().bookStatus,
          docId     : doc.id
        })
      }
    })
})}



sendNotification=()=>{
  //to get the first name and last name
  db.collection('Users').where('emailAdress','==',this.state.userId).get()
  .then((snapshot)=>{
    snapshot.forEach((doc)=>{
      var name = doc.data().firstName
      var lastName = doc.data().lastName

      // to get the donor id and book nam
      db.collection('allNotifications').where('RequestID','==',this.state.requestId).get()
      .then((snapshot)=>{
        snapshot.forEach((doc) => {
          var donorId  = doc.data().DonorID
          var bookName =  doc.data().BookName

          //targert user id is the donor id to send notification to the user
          db.collection('allNotifications').add({
            "targetedUserID" : donorId,
            "Message" : name +" " + lastName + " received the book " + bookName ,
            "notificationStatus" : "unread",
            "BookName" : bookName
          })
        })
      })
    })
  })
}

componentDidMount(){
  this.getBookRequest()
  this.getIsBookRequestActive()
  
}

updateBookRequestStatus=()=>{
  //updating the book status after receiving the book
  db.collection('BookRequests').doc(this.state.docId)
  .update({
    bookStatus : 'recieved'
  })

  //getting the  doc id to update the Users doc
  db.collection('Users').where('emailAdress','==',this.state.userId).get()
  .then((snapshot)=>{
    snapshot.forEach((doc) => {
      //updating the doc
      db.collection('Users').doc(doc.id).update({
        IsBookRequestActive: false
      })
    })
  })
}

async getBooksFromApi(bookName){
  this.setState({
    bookName: bookName
 })
if(bookName.lenght > 2){
  var book = await BookSearch.searchbook(bookName,'AIzaSyBm3HorF5uhRSlp8VoYVPx3JZhqMTig8WY')

  this.setState({
    dataSoucre : books.data,
    showFlatList : true,
  })
}
}

renderItem = ({item,i}) => {
  return( 
    <TouchableHighlight
      style={{ alignItems: "center",
       backgroundColor: "#DDDDDD", 
       padding: 10, width: '90%',
        }}
         activeOpacity={0.6} 
         underlayColor="#DDDDDD" 
         onPress={()=>{ this.setState({ 
           showFlatlist:false, 
           bookName:item.volumeInfo.title, 
           })}
            }
          bottomDivider>
        <Text>{item.volumeInfo.title} </Text>
    </TouchableHighlight>
     
    
    
  )
}


  render(){

    if(this.state.IsBookRequestActive === true){
      return(

        // Status screen

        <View style = {{flex:1,justifyContent:'center'}}>
          <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
          <Text>Book Name</Text>
          <Text>{this.state.requestedBookName}</Text>
          </View>
          <View style={{borderColor:"orange",borderWidth:2,justifyContent:'center',alignItems:'center',padding:10,margin:10}}>
          <Text> Book Status </Text>

          <Text>{this.state.bookStatus}</Text>
          </View>

          <TouchableOpacity style={{borderWidth:1,borderColor:'orange',backgroundColor:"orange",width:300,alignSelf:'center',alignItems:'center',height:30,marginTop:30}}
          onPress={()=>{
            this.sendNotification()
            this.updateBookRequestStatus();
            this.receivedBooks(this.state.requestedBookName)
          }}>
          <Text>I recieved the book </Text>
          </TouchableOpacity>
        </View>
      )
    }
    else
    {
    return(
      // Form screen
        <View style={{flex:1}}>
          <MyHeader title="Request Book" navigation ={this.props.navigation}/>

          <ScrollView>
            <KeyboardAvoidingView style={styles.keyBoardStyle}>
              <TextInput
                style ={styles.formTextInput}
                placeholder={"enter book name"}
                onChangeText={(text)=>{
                    this.setState({
                        bookName:text
                    })
                }}
                value={this.state.bookName}
              />
              {this.state.showFlatList ? 
              (<FlatList
            data = {this.state.dataSoucre}
            renderItem = {this.renderItem}
            enableEmptySections = {true}
            style = {{marginTop : 10,}}
            keyExtractor = {(item,index) => index.toString()}
              />)
              :  (
                <View style = {{alignItems : 'center'}}>

            
              <TextInput
                style ={[styles.formTextInput,{height:300}]}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the book"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{ this.addRequest(this.state.bookName,this.state.reasonToRequest);
                }}
                >
                <Text>Request</Text>
              </TouchableOpacity>
              </View>
              )}

            </KeyboardAvoidingView>
            </ScrollView>
        </View>
    )
  }
}
}

const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)
