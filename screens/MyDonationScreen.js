import React ,{Component} from 'react'
import {View, Text,TouchableOpacity,ScrollView,FlatList,StyleSheet} from 'react-native';
import {Card,Icon,ListItem} from 'react-native-elements'
import MyHeader from '../components/MyHeader.js'
import firebase from 'firebase';
import db from '../config.js'

export default class MyDonationScreen extends Component {
   constructor(){
     super()
     this.state = {
       donorId : firebase.auth().currentUser.email,
       donorName : "",
       allDonations : []
     }
     this.requestRef= null
   }

   static navigationOptions = { header: null };

   getDonorDetails=(donorId)=>{
     db.collection("Users").where("emailAdress","==", donorId).get()
     .then((snapshot)=>{
       snapshot.forEach((doc) => {
         this.setState({
           "donorName" : doc.data().firstName + " " + doc.data().lastName
         })
       });
     })
   }

   getAllDonations =()=>{
     this.requestRef = db.collection("allDonations").where("DonorID" ,'==', this.state.donorId)
     .onSnapshot((snapshot)=>{
       var allDonations = []
       snapshot.docs.map((doc) =>{
         var donation = doc.data()
         donation["doc_id"] = doc.id
         allDonations.push(donation)
       });
       this.setState({
         allDonations : allDonations
       });
     })
   }

   sendBook=(bookDetails)=>{
     if(bookDetails.RequestStatus === "Book Sent"){
       var requestStatus = "Donor Interested"
       db.collection("allDonations").doc(bookDetails.doc_id).update({
         "RequestStatus" : "Donor Interested"
       })
       this.sendNotification(bookDetails,requestStatus)
     }
     else{
       var requestStatus = "Book Sent"
       db.collection("allDonations").doc(bookDetails.doc_id).update({
         "RequestStatus" : "Book Sent"
       })
       this.sendNotification(bookDetails,requestStatus)
     }
   }

   sendNotification=(bookDetails,requestStatus)=>{
     var requestId = bookDetails.RequestID
     var donorId = bookDetails.DonorID
     db.collection("allNotifications")
     .where("RequestID","==", requestId)
     .where("DonorID","==",donorId)
     .get()
     .then((snapshot)=>{
       snapshot.forEach((doc) => {
         var Message = ""
         if(requestStatus === "Book Sent"){
           Message = this.state.donorName + " sent you book"
         }else{
            Message =  this.state.donorName  + " has shown interest in donating the book"
         }
         db.collection("allNotifications").doc(doc.id).update({
           "Message": Message,
           "notificationStatus" : "unread",
           "date"                : firebase.firestore.FieldValue.serverTimestamp()
         })
       });
     })
   }

   keyExtractor = (item, index) => index.toString()

   renderItem = ( {item, i} ) =>(
     <ListItem
       key={i}
       title={item.BookName}
       subtitle={"Requested By : " + item.RequestedBy +"\nStatus : " + item.RequestStatus}
       leftElement={<Icon name="book" type="font-awesome" color ='#696969'/>}
       titleStyle={{ color: 'black', fontWeight: 'bold' }}
       rightElement={
           <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor : item.RequestStatus === "Book Sent" ? "green" : "#ff5722"
              }
            ]}
            onPress = {()=>{
              this.sendBook(item)
            }}
           >
             <Text style={{color:'#ffff'}}>{
               item.RequestStatus === "Book Sent" ? "Book Sent" : "Send Book"
             }</Text>
           </TouchableOpacity>
         }
       bottomDivider
     />
   )


   componentDidMount(){
     this.getDonorDetails(this.state.donorId)
     this.getAllDonations()
   }

   componentWillUnmount(){
     this.requestRef();
   }

   render(){
     return(
       <View style={{flex:1}}>
         <MyHeader navigation={this.props.navigation} title="My Donations"/>
         <View style={{flex:1}}>
           {
             this.state.allDonations.length === 0
             ?(
               <View style={styles.subtitle}>
                 <Text style={{ fontSize: 20}}>List of all book Donations</Text>
               </View>
             )
             :(
               <FlatList
                 keyExtractor={this.keyExtractor}
                 data={this.state.allDonations}
                 renderItem={this.renderItem}
               />
             )
           }
         </View>
       </View>
     )
   }
   }


const styles = StyleSheet.create({
  button:{
    width:100,
    height:30,
    justifyContent:'center',
    alignItems:'center',
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8
     },
    elevation : 16
  },
  subtitle :{
    flex:1,
    fontSize: 20,
    justifyContent:'center',
    alignItems:'center'
  }
})
