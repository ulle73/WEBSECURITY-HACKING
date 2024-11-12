
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/Context';
import { Navigate, Link } from 'react-router-dom';
import { ListGroup, Row, Col } from 'react-bootstrap';

import axios from 'axios';

function Logs() {
  const { user, setError } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  
  
  const simplifyUserAgent = (userAgent) => {
    // Kontrollera om userAgent är definierad, annars returnera standardvärde
    if (!userAgent) return "Unknown Browser - Unknown OS";

    // Hitta webbläsare
    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Opera|Edge|MSIE|Trident|Edg|OPR)\/?(\d+)?/i);

    // Hitta operativsystem
    const osMatch = userAgent.match(/\(([^)]+)\)/);

    // Använd första matchningen eller sätt "Unknown" som standardvärde
    const browser = browserMatch ? browserMatch[1] : "Unknown Browser";
    const os = osMatch ? osMatch[1].split(";")[0] : "Unknown OS";

    // Formatera webbläsarens namn för Microsoft Edge och Opera
    const formattedBrowser = browser === "Edg" ? "Edge" : browser === "OPR" ? "Opera" : browser;

    return `${formattedBrowser} - ${os}`;
  };



 
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin-logs`, { withCredentials: true });

        // Förenkla varje loggpost
        const simplifiedLogs = response.data.logs.map((log) => ({
          ...log,
          userAgent: simplifyUserAgent(log.userAgent),
        }));

        //console.log("Fetched logs:", simplifiedLogs); // Felsökningslogg för att se innehållet
        setLogs(simplifiedLogs);
        setError(null);
      } catch (err) {
        console.error("Error fetching logs:", err); // Logga eventuella fel
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
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin-page`, {
          withCredentials: true,  
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
    <div className="container text-center ">
      <h1 className="mb-4">Admin-Logs</h1>
      <ListGroup style={{ width: '100%' }} className="mx-auto" variant="flush">
        {logs.slice(0, 100).map((log, index) => (
          <ListGroup.Item key={index} className="m-0">
            <Row >
              <Col xs={2} style={{overflow: 'hidden'}} className="text-start">
                <strong>{log.username}</strong>
              </Col>
              <Col xs={2} className="text-center">
                {log.time}
              </Col>
              <Col xs={1} className="text-center">
                {log.ipAddress}
              </Col>
              <Col xs={4} className="text-center">
                {log.userAgent}
              </Col>
              <Col xs={1} className="text-center">
                {log.success ? (
                  <span className="text-success">Lyckad</span>
                ) : (
                  <span className="text-danger">Misslyckad</span>
                )}
              </Col>
              <Col xs={2} className="text-end">
                {log.message}
              </Col>
            </Row>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default Logs;
