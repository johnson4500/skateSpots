import { React, useMemo, useState, useEffect} from "react";
import { Slide } from "react-slideshow-image";
import { getDatabase, get, child, update, ref as dbRef, onValue, remove} from 'firebase/database';
import { auth, rtDB} from '../firebaseconfig';
import { v4 } from "uuid";
import { useAuth } from "../AuthContext";

export function SpotInfoContainer({
  properties,
  spotID,
  filteredData,
  spotClick,
  showMap,
  position
}) {

  const { authUser, setAuthUser } = useAuth();
  const [text, setText] = useState("");
  const [commentsData, setCommentsData] = useState({});
  const commentRef = useMemo(() => dbRef(rtDB, 'spots/' + filteredData[spotID].spotName + '/comments'), [filteredData, spotID]);

  const handleChange = (e) => {
    const textarea = e.target;
    textarea.style.height = "25px";
    textarea.style.height = `${textarea.scrollHeight}px`;
    setText(e.target.value);
  };

  const postComment = () => {
    if (authUser !== null) {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();

      const formattedDateTime = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day} ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
      if (text.length > 1) {
        update(commentRef, {
          [commentsData.length + 1]: {
            content: text,
            date: formattedDateTime,
            likes: {
              [0]: ""
            },
            author: authUser.displayName
          },
        }).then(() => {
          setText("");
          console.log("Comment added.");
        });
      } 
    } else {
      window.alert("Please sign in to comment!");
    }
  }

  const sendLike = (e) => {
    if (authUser !== null && authUser.emailVerified) {
      get(child(dbRef(rtDB, 'spots/' + filteredData[spotID].spotName + '/comments' + '/' + e.target.id + '/likes'), authUser.displayName))
      .then((snapshot) => { 
        if (snapshot.exists()) {
          const data = snapshot.val();
          remove(dbRef(rtDB, 'spots/' + filteredData[spotID].spotName + '/comments' + '/' + e.target.id + '/likes' + '/' + authUser.displayName));
        } else {
          update(dbRef(rtDB, 'spots/' + filteredData[spotID].spotName + '/comments' + '/' + e.target.id + "/likes"), {
            [authUser.displayName]: authUser.displayName
          });
        }
      });
    } else {
      window.alert("Please log in and verify your account to like and comment!");
    }
  }
  
  useEffect(() => {
    console.log(authUser)
    const unsubscribe = onValue(commentRef, (snapshot) => {
      const newComments = [];
      snapshot.forEach(childSnapshot => {
        newComments.push(childSnapshot.val());
      });

      // Sort comments by date posted (oldest to newest)
      const sortedComments = newComments.slice().sort((a, b) => {
        const timestampA = a.content.slice(a.content.length - 16, a.content.length); // Extract timestamp substring
        const timestampB = b.content.slice(b.content.length - 16, b.content.length);
      
        const timeA = new Date(timestampA);
        const timeB = new Date(timestampB);
      
        return timeA - timeB;
      });
      
      setCommentsData(sortedComments);
    });

    return () => unsubscribe(); // Cleanup function to unsubscribe from the event listener
  }, [commentRef]);
  

  return (
  <>
  <div className="spotInfoContainer">
    <div className="imageContainer">
      <div className='spotImage'>
          <Slide {...properties}>
            {filteredData[spotID].uploadedImgURLs.map((data, i) => 
              <div key={i + "spotImage"}>
                <img draggable="false" className="spotImage" src={data}></img>
              </div>)}
          </Slide>
        </div>
      </div>
      <div style = {{marginTop: "10px"}}>
        <strong id="spotTitleText">Spot Name: {filteredData[spotID].spotName}</strong>
      </div>
      <a href = {`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`} target="_blank" style = {{textDecoration: "none"}} id="spotAddress">Address: {filteredData[spotID].spotAddress}</a>
      <div className="spotDescription">
        <p id="spotDescriptionText">{filteredData[spotID].spotDescription}</p>
      </div>
      <button id="backButton" onClick={() => {
        spotClick();
        showMap();
      }}> Back</button>
      <div> 
        <strong style = {{fontSize: "25px"}}>
          Comments
        </strong>
      </div>
      {/* <div className = "commentContainer" style = {{height: "500px", width: "90%", backgroundColor: "gray", borderRadius: "20px", borderStyle: "solid", borderWidth: "5px"}}> */}
  
      <div className="textAreaContainer">
        <textarea
          className="textArea"
          placeholder="Enter your comment here..."
          name="comment"
          value={text}
          onChange={handleChange}
        >
        </textarea>
        <div 
          style = {{
            height: "40px",
            width: "40px",
            marginBottom: "10px", 
            float: "right",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }} 
          className= "sendIcon"
          role="button"
          tabIndex="0"
          onClick={postComment}
        >
          <img id = "sendImg" src = "https://cdn.iconscout.com/icon/free/png-256/free-send-forward-arrow-right-direction-import-30559.png" 
          style = {{
            height: "20px", 
            width: "20px", 
            left: "10px",
            color: "blue"
          }}
          />
        </div>
      </div>
  
      <div className = "commentsContainer">
        {commentsData.length > 0 ? (
          commentsData.map((element, i) => (
          <div className="comments">
            <div style = {{height: "30px"}}>
            <p style = {{marginBottom: "0"}}>{element.date}</p>
            </div>
            <div style = {{marginBottom: "5px"}}>
             <strong>{element.content}</strong>
            </div>
             <div style = {{ marginBottom: "15px",}}>
              <p style = {{float: "left"}}>Posted by: {element.author}</p>
              <p style = {{float: "right", marginLeft: "5px"}}>{Object.keys(element.likes).length - 1}</p>
              <img
                id = {i + 1}
                src = "https://cdn-icons-png.flaticon.com/512/81/81250.png" 
                style = {{
                  width: "20px", 
                  height: "20px", 
                  float: "right"
                }}
                role="button"
                tabIndex="0"
                onClick={sendLike}
              ></img>
            </div>
          </div>
          ))
        ) : (
          null
        )}
      </div>
    </div>
    </>
  )
}
  