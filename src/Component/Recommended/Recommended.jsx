import React, { useEffect, useState } from "react";
import "./Recommended.css";
import { value_convertor } from "../../Data";
import { API_KEY } from "../../Data";
import { Link } from "react-router-dom";

// Define a default category ID (e.g., '10' for Music)
const DEFAULT_CATEGORY_ID = '10';

const Recommended = ({ categoryId }) => {
  const [apiData, setApidata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const recommended_video = async (catId) => {
    try {
      const recommended_video_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=US&videoCategoryId=${catId}&key=${API_KEY}`;
      const response = await fetch(recommended_video_url);
      if (!response.ok) {
        
        return recommended_video(DEFAULT_CATEGORY_ID); 
      }
      const data = await response.json();
      setApidata(data.items || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recommended_video(categoryId || DEFAULT_CATEGORY_ID);
  }, [categoryId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="recommended">
      {apiData.length > 0 ? (
        apiData.map((item, index) => (
          <Link
            to={`/video/${categoryId || DEFAULT_CATEGORY_ID}/${item.id}`}
            key={index}
            className="side-video-list"
          >
            <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title} />
            <div className="video-info">
              <h4>{item.snippet.title}</h4>
              <p>{item.snippet.channelTitle}</p>
              <p>{value_convertor(item.statistics.viewCount)}</p>
            </div>
          </Link>
        ))
      ) : (
        <p>No recommended videos available.</p>
      )}
    </div>
  );
};

export default Recommended;
