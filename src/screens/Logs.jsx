
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/Context';
import { Navigate, Link } from 'react-router-dom';
import { Card, Button, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function Logs() {
  const { user, setError } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  
 
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin-logs`, { withCredentials: true });
        setLogs(response.data.logs);
        setError(null);
      } catch (err) {
        setError(err.response?.data.message);
      }
    };

    // Hämta loggar omedelbart när komponenten mountar
    fetchLogs();

    // Ställ in ett intervall för att hämta loggar regelbundet, t.ex. var 5:e sekund
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);

    // Städa upp intervallet när komponenten unmountas
    return () => clearInterval(interval);
  }, []);
 

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user || user.role !== 'admin') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/admin-page', {
          withCredentials: true,  // Skicka cookies automatiskt
        });

        if (response.status === 200) {
          setIsAdmin(true);
        }
        
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      checkAdmin();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || isAdmin === false) {
    return <Navigate to="/user-page" />;
  }

  return (
    <div className="container text-center">
      <h1 className="mb-4">Admin-Logs</h1>
      {logs.map((log, index)=>{
        return (<li key={index}>
          <strong>{log.username}</strong> - {log.time} - {log.success ? 'Lyckad' : 'Misslyckad'} - {log.message}
          
        </li>)
      })}
    
    </div>
  );
}

export default Logs;
