import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './SearchResults.css'; // Import the CSS for styling
import { API_KEY, value_convertor } from '../../Data'; // Import value_convertor
import moment from 'moment';

const SearchResults = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('query') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const search_url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${API_KEY}`;
        const searchResponse = await fetch(search_url);
        if (!searchResponse.ok) {
          throw new Error(`HTTP error! Status: ${searchResponse.status}`);
        }
        const searchData = await searchResponse.json();

        // Fetch video details (including view count)
        const videoIds = searchData.items.map(video => video.id.videoId).join(',');
        const details_url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${API_KEY}`;
        const detailsResponse = await fetch(details_url);
        if (!detailsResponse.ok) {
          throw new Error(`HTTP error! Status: ${detailsResponse.status}`);
        }
        const detailsData = await detailsResponse.json();

        // Merge snippet and statistics data
        const mergedResults = searchData.items.map(video => ({
          ...video,
          statistics: detailsData.items.find(item => item.id === video.id.videoId)?.statistics || {},
        }));

        setResults(mergedResults);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  return (
    <div className='feed'>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {results.length === 0 && !loading && <p>No results found for "{query}"</p>}
      {results.map((video) => (
        <Link to={`/video/defaultCategory/${video.id.videoId}`} className="card" key={video.id.videoId}>
          <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} />
          <h2>{video.snippet.title}</h2>
          <h3>{video.snippet.channelTitle}</h3>
          <p>{value_convertor(video.statistics.viewCount)} Views &bull; {moment(video.snippet.publishedAt).fromNow()}</p>
        </Link>
      ))}
    </div>
  );
};

export default SearchResults;
