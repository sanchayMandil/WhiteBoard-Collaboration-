import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useParams } from 'react-router-dom';
import { faPencil, faEraser, faUndo, faRedo, faEye, faEyeSlash, faLayerGroup, faUsers, faSave, faLink, faCheck, faBan, faStop } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import io from 'socket.io-client';
import { debounce } from 'lodash';

const ENDPOINT = 'http://localhost:5001';

const Board = () => {
  const { whiteboardId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const stageRef = useRef(null);
  
  const [layers, setLayers] = useState([
    { id: 'layer-0', name: 'Host Layer', lines: [], isVisible: true },
    { id: 'layer-1', name: 'Guest Layer', lines: [], isVisible: true },
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer-0');
  const [title, setTitle] = useState('Untitled');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [realTimeCollaborationStarted, setRealTimeCollaborationStarted] = useState(false);
  const [createdBy, setCreatedBy] = useState('');
  const [participants, setParticipants] = useState([]);
  const [drawingPermissions, setDrawingPermissions] = useState({});
  const [inviteLink, setInviteLink] = useState('');
  const [isLayerListVisible, setIsLayerListVisible] = useState(false);
  const [isParticipantListVisible, setIsParticipantListVisible] = useState(false);
  const [error, setError] = useState(null);

  const isHost = userEmail === createdBy;
  const hasDrawingPermission = isHost || drawingPermissions[userEmail] === true;

  // Set active layer based on host status
  useEffect(() => {
    if (userEmail) {
      setActiveLayerId(isHost ? 'layer-0' : 'layer-1');
    }
  }, [userEmail, isHost]);

  // Debounced socket emission for drawing actions
  const emitDrawAction = useCallback(
    debounce((layerId, lines, email) => {
      socketRef.current?.emit('drawAction', {
        layerId,
        lines,
        email,
      });
    }, 50),
    []
  );

  // Initialize user authentication and creator status
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to access the whiteboard');
      navigate('/');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const email = decoded.email || 'Unknown Email';
      setUserEmail(email);
      if (whiteboardId) {
        axios.get(`${ENDPOINT}/board/${whiteboardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(response => {
          setCreatedBy(response.data.creatorEmail || '');
        }).catch(err => {
          console.error('Error fetching whiteboard data:', err);
        });
      } else {
        setCreatedBy(email);
      }
    } catch (err) {
      setError('Invalid session. Please log in again.');
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate, whiteboardId]);

  // Load whiteboard data
  useEffect(() => {
    if (!whiteboardId) return;

    const loadWhiteboard = async () => {
      try {
        const response = await axios.get(`${ENDPOINT}/board/${whiteboardId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        
        setTitle(response.data.title);
        if (response.data.layers?.length) {
          setLayers(response.data.layers.map((layer, index) => ({
            ...layer,
            name: index === 0 ? 'Host Layer' : `Guest Layer ${index}`,
            isVisible: true
          })));
        }
        setInviteLink(`${window.location.origin}/board/${whiteboardId}`);
      } catch (err) {
        setError('Failed to load whiteboard');
        console.error('Load error:', err);
      }
    };

    loadWhiteboard();
  }, [whiteboardId]);

  // Socket.IO connection
  useEffect(() => {
    if (!userEmail || !whiteboardId) return;

    socketRef.current = io(ENDPOINT, {
      query: { token: localStorage.getItem('token'), whiteboardId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socketRef.current.on('connect_error', (err) => {
      setError('Failed to connect to server. Retrying...');
      console.error('Connection error:', err);
    });

    socketRef.current.on('participantsUpdated', (participants) => {
      const uniqueParticipants = Array.from(
        new Map(participants.map(p => [p.email, p])).values()
      );
      setParticipants(uniqueParticipants);
      setDrawingPermissions(prev => {
        const newPermissions = { ...prev };
        uniqueParticipants.forEach(p => {
          if (!(p.email in newPermissions)) {
            newPermissions[p.email] = p.email === createdBy;
          }
        });
        return newPermissions;
      });
    });

    socketRef.current.on('drawAction', (data) => {
      if (data.email !== userEmail) {
        setLayers(prev => prev.map(layer =>
          layer.id === data.layerId ? { ...layer, lines: [...data.lines] } : layer
        ));
      }
    });

    socketRef.current.on('clearLayer', (layerId) => {
      setLayers(prev => prev.map(layer =>
        layer.id === layerId ? { ...layer, lines: [] } : layer
      ));
      setUndoStack(prev => [...prev, [...layers]]);
      setRedoStack([]);
    });

    socketRef.current.on('permissionUpdated', ({ email, canDraw }) => {
      setDrawingPermissions(prev => ({
        ...prev,
        [email]: canDraw,
      }));
    });

    socketRef.current.on('sessionEnded', () => {
      if (!isHost) {
        setError('Session has been ended by the host');
        socketRef.current?.disconnect();
        navigate('/');
      }
    });

    socketRef.current.on('error', (message) => {
      setError(message);
      console.error('Socket error:', message);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userEmail, whiteboardId, layers, createdBy, isHost, navigate]);

  // Permission handling
  const grantPermission = (email) => {
    if (!isHost) {
      setError('Only the host can grant permissions');
      return;
    }
    socketRef.current?.emit('grantPermission', { whiteboardId, email });
  };

  const revokePermission = (email) => {
    if (!isHost) {
      setError('Only the host can revoke permissions');
      return;
    }
    socketRef.current?.emit('revokePermission', { whiteboardId, email });
  };

  // Drawing handlers
  const startDrawing = useCallback(() => {
    const pos = stageRef.current.getPointerPosition();
    if (!pos) return;

    if (isHost && activeLayerId !== 'layer-0') {
      setError('Host can only draw on Host Layer');
      return;
    }
    if (!isHost && activeLayerId !== 'layer-1') {
      setError('Guests can only draw on Guest Layer');
      return;
    }
    if (!hasDrawingPermission) {
      setError('You do not have permission to draw');
      return;
    }

    setIsDrawing(true);
    if (!isEraserMode) {
      setLayers(prev => prev.map(layer =>
        layer.id === activeLayerId ? {
          ...layer,
          lines: [...layer.lines, { points: [pos.x, pos.y], color, brushSize }],
        } : layer
      ));
    }
  }, [activeLayerId, color, brushSize, isEraserMode, isHost, hasDrawingPermission]);

  const drawOrErase = useCallback(() => {
    if (!isDrawing) return;
    
    const pos = stageRef.current.getPointerPosition();
    if (!pos) return;

    if (isHost && activeLayerId !== 'layer-0') {
      setError('Host can only draw on Host Layer');
      return;
    }
    if (!isHost && activeLayerId !== 'layer-1') {
      setError('Guests can only draw on Guest Layer');
      return;
    }
    if (!hasDrawingPermission) {
      setError('You do not have permission to draw');
      return;
    }

    setLayers(prev => {
      const newLayers = prev.map(layer => {
        if (layer.id !== activeLayerId) return layer;

        if (isEraserMode) {
          return {
            ...layer,
            lines: layer.lines.filter(line => {
              for (let i = 0; i < line.points.length; i += 2) {
                const x = line.points[i];
                const y = line.points[i + 1];
                const distance = Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2);
                if (distance < brushSize) return false;
              }
              return true;
            }),
          };
        } else {
          return {
            ...layer,
            lines: layer.lines.map((line, i) =>
              i === layer.lines.length - 1
                ? { ...line, points: [...line.points, pos.x, pos.y] }
                : line
            ),
          };
        }
      });

      const activeLayer = newLayers.find(layer => layer.id === activeLayerId);
      emitDrawAction(activeLayerId, activeLayer?.lines || [], userEmail);

      return newLayers;
    });
  }, [isDrawing, isEraserMode, activeLayerId, brushSize, userEmail, emitDrawAction, isHost, hasDrawingPermission]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setUndoStack(prev => [...prev, [...layers]]);
      setRedoStack([]);
      const activeLayer = layers.find(layer => layer.id === activeLayerId);
      emitDrawAction.flush();
      socketRef.current?.emit('drawAction', {
        layerId: activeLayerId,
        lines: activeLayer?.lines || [],
        email: userEmail,
      });
    }
  }, [isDrawing, layers, activeLayerId, userEmail, emitDrawAction]);

  // Whiteboard controls
  const saveWhiteboard = async () => {
    if (realTimeCollaborationStarted) {
      if (!isHost) {
        alert('Only the host can save the whiteboard during collaboration mode.');
        return;
      }
    } else {
      if (userEmail !== createdBy) {
        alert('Only the creator can save the whiteboard when collaboration mode is off.');
        return;
      }
    }

    try {
      let response;
      if (!whiteboardId) {
        response = await axios.post(
          `${ENDPOINT}/board/save`,
          { title, layers, creatorEmail: userEmail },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setError(null);
        alert('Whiteboard created successfully');
      } else {
        response = await axios.put(
          `${ENDPOINT}/board/${whiteboardId}`,
          { title, layers, creatorEmail: userEmail },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setError(null);
        alert('Whiteboard saved successfully');
      }
      return response.data;
    } catch (err) {
      setError('Failed to save whiteboard');
      console.error('Save error:', err);
    }
  };

  const handleInviteClick = async () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      alert('Invite link copied to clipboard!');
      if (!realTimeCollaborationStarted) {
        setRealTimeCollaborationStarted(true);
      }
      return;
    }
  
    try {
      const response = await axios.get(`${ENDPOINT}/create`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const newWhiteboardId = response.data.whiteboardId;
      setInviteLink(`${window.location.origin}/board/${newWhiteboardId}`);
      navigate(`/board/${newWhiteboardId}`);
      setRealTimeCollaborationStarted(true);
    } catch (err) {
      setError('Failed to create whiteboard');
      console.error('Create error:', err);
    }
  };

  const clearCanvas = () => {
    if (realTimeCollaborationStarted && !isHost) {
      alert('Only the host can clear the layer in collaboration mode');
      return;
    }
  
    setUndoStack(prev => [...prev, [...layers]]);
    setRedoStack([]);
    setLayers(prev => prev.map(layer =>
      layer.id === activeLayerId ? { ...layer, lines: [] } : layer
    ));
  
    if (realTimeCollaborationStarted) {
      socketRef.current?.emit('clearLayer', activeLayerId);
    }
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    setRedoStack(prev => [...prev, [...layers]]);
    setLayers(undoStack[undoStack.length - 1]);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    setUndoStack(prev => [...prev, [...layers]]);
    setLayers(redoStack[redoStack.length - 1]);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const endSession = async () => {
    if (!isHost) {
      setError('Only the host can end the session');
      return;
    }
    if (!realTimeCollaborationStarted) {
      setError('Session is not in collaboration mode');
      return;
    }

    try {
      // Save the whiteboard before ending the session
      await saveWhiteboard();
      // Emit end session event
      socketRef.current?.emit('endSession', { whiteboardId });
      setRealTimeCollaborationStarted(false);
      setParticipants([participants.find(p => p.email === userEmail)]);
      setDrawingPermissions({ [userEmail]: true });
      setInviteLink('');
      setError(null);
      alert('Session ended and whiteboard saved');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to end session');
      console.error('End session error:', err);
    }
  };

  const isClearDisabled = realTimeCollaborationStarted && !isHost;
  const isSaveDisabled = realTimeCollaborationStarted ? !isHost : userEmail !== createdBy;
  const isEndSessionDisabled = !isHost || !realTimeCollaborationStarted;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-md"
          placeholder="Whiteboard Title"
        />
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Color</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 rounded-md"
            disabled={!hasDrawingPermission}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Brush Size: {brushSize}</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full"
            disabled={!hasDrawingPermission}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEraserMode(true)}
            className={`flex-1 p-2 rounded-md ${isEraserMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            disabled={!hasDrawingPermission}
          >
            <FontAwesomeIcon icon={faEraser} />
          </button>
          <button
            onClick={() => setIsEraserMode(false)}
            className={`flex-1 p-2 rounded-md ${!isEraserMode ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            disabled={!hasDrawingPermission}
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={undo}
            className="flex-1 p-2 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={undoStack.length === 0 || !hasDrawingPermission}
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            onClick={redo}
            className="flex-1 p-2 bg-gray-200 rounded-md hover:bg-gray-300"
            disabled={redoStack.length === 0 || !hasDrawingPermission}
          >
            <FontAwesomeIcon icon={faRedo} />
          </button>
        </div>

        <button
          onClick={() => !isClearDisabled && clearCanvas()}
          className={`p-2 rounded-md text-white ${
            isClearDisabled
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-red-500 hover:bg-red-600'
          }`}
          disabled={isClearDisabled}
          title={isClearDisabled ? 'Only host can clear layer in collaboration mode' : 'Clear current layer'}
        >
          Clear Layer
        </button>

        <button
          onClick={() => !isSaveDisabled && saveWhiteboard()}
          className={`p-2 rounded-md text-white ${
            isSaveDisabled
              ? 'bg-gray-400 cursor-not-allowed opacity-50'
              : 'bg-green-500 hover:bg-green-600'
          }`}
          disabled={isSaveDisabled}
          title={isSaveDisabled 
            ? realTimeCollaborationStarted 
              ? 'Only host can save in collaboration mode' 
              : 'Only creator can save when collaboration is off'
            : 'Save Whiteboard'}
        >
          <FontAwesomeIcon icon={faSave} /> Save
        </button>

        <button
          onClick={handleInviteClick}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <FontAwesomeIcon icon={faLink} /> {inviteLink ? 'Copy Invite' : 'Create Invite'}
        </button>

        {isHost && (
          <button
            onClick={() => !isEndSessionDisabled && endSession()}
            className={`p-2 rounded-md text-white ${
              isEndSessionDisabled
                ? 'bg-gray-400 cursor-not-allowed opacity-50'
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
            disabled={isEndSessionDisabled}
            title={isEndSessionDisabled
              ? realTimeCollaborationStarted
                ? 'Only host can end session'
                : 'Session is not in collaboration mode'
              : 'End Session and Save'}
          >
            <FontAwesomeIcon icon={faStop} /> End Session
          </button>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <Stage
          width={window.innerWidth - 256}
          height={window.innerHeight}
          ref={stageRef}
          onMouseDown={startDrawing}
          onMouseMove={drawOrErase}
          onMouseUp={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={drawOrErase}
          onTouchEnd={stopDrawing}
        >
          {layers.map(layer => (
            <Layer key={layer.id} visible={layer.isVisible}>
              {layer.lines.map((line, index) => (
                <Line
                  key={index}
                  points={line.points}
                  stroke={line.color}
                  strokeWidth={line.brushSize}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                />
              ))}
            </Layer>
          ))}
        </Stage>

        {/* Layer and Participant Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
          <button
            onClick={() => setIsLayerListVisible(!isLayerListVisible)}
            className="bg-white p-3 rounded-md shadow-md hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faLayerGroup} /> Layers
          </button>
          <button
            onClick={() => setIsParticipantListVisible(!isParticipantListVisible)}
            className="bg-white p-3 rounded-md shadow-md hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faUsers} /> Participants
          </button>
        </div>

        {isLayerListVisible && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white p-4 rounded-md shadow-lg w-64">
            <h3 className="font-semibold mb-2">Layers</h3>
            {layers
              .filter(layer => isHost || layer.id === 'layer-1')
              .map(layer => (
                <div
                  key={layer.id}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    activeLayerId === layer.id ? 'bg-blue-100' : 'bg-gray-100'
                  } mb-1`}
                >
                  <button
                    onClick={() => setActiveLayerId(layer.id)}
                    className="flex-grow text-left"
                    disabled={!isHost && layer.id === 'layer-0'}
                  >
                    {layer.name}
                  </button>
                  <button
                    onClick={() => setLayers(prev => prev.map(l =>
                      l.id === layer.id ? { ...l, isVisible: !l.isVisible } : l
                    ))}
                    disabled={!isHost && layer.id === 'layer-0'}
                  >
                    <FontAwesomeIcon icon={layer.isVisible ? faEye : faEyeSlash} />
                  </button>
                </div>
              ))}
          </div>
        )}

        {isParticipantListVisible && (
          <div className="absolute bottom-20 left-1/2 translate-x-10 bg-white p-4 rounded-md shadow-lg w-64">
            <h3 className="font-semibold mb-2">Participants</h3>
            {participants.length === 0 ? (
              <p className="text-gray-500">No participants yet</p>
            ) : (
              participants.map(participant => (
                <div
                  key={participant.email}
                  className="p-2 bg-gray-100 rounded-md mb-1 flex items-center justify-between"
                >
                  <span>
                    {participant.username} ({participant.email}) {participant.email === createdBy ? '(Host)' : ''}
                    {drawingPermissions[participant.email] ? (
                      <span className="text-green-500 ml-2">
                        <FontAwesomeIcon icon={faCheck} /> Can Draw
                      </span>
                    ) : (
                      <span className="text-red-500 ml-2">
                        <FontAwesomeIcon icon={faBan} /> No Draw
                      </span>
                    )}
                  </span>
                  {isHost && participant.email !== userEmail && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => grantPermission(participant.email)}
                        className={`p-1 rounded-md ${
                          drawingPermissions[participant.email]
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                        disabled={drawingPermissions[participant.email]}
                        title="Grant drawing permission"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        onClick={() => revokePermission(participant.email)}
                        className={`p-1 rounded-md ${
                          !drawingPermissions[participant.email]
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                        disabled={!drawingPermissions[participant.email]}
                        title="Revoke drawing permission"
                      >
                        <FontAwesomeIcon icon={faBan} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;