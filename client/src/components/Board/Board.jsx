import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate, useParams } from 'react-router-dom';
import { faPencil, faEraser, faUndo, faRedo, faEye, faEyeSlash, faLayerGroup, faUsers, faSave, faLink, faCheck, faBan, faStop, faHandPaper, faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import io from 'socket.io-client';
import { debounce } from 'lodash';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [toolMode, setToolMode] = useState('pencil'); // 'pencil', 'eraser', or 'pan'
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
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const lastPanPos = useRef(null);
  const errorTimeoutRef = useRef(null);

  const isHost = userEmail === createdBy;
  const hasDrawingPermission = isHost || drawingPermissions[userEmail] === true;

  const setErrorWithTimeout = useCallback((message) => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    setError(message);
    if (message) {
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 3000);
    }
  }, []);

  useEffect(() => {
    console.log('Board component re-rendered', { userEmail, whiteboardId, drawingPermissions });
  }, [userEmail, whiteboardId, drawingPermissions, layers]);

  useEffect(() => {
    if (userEmail) {
      setActiveLayerId(isHost ? 'layer-0' : 'layer-1');
    }
  }, [userEmail, isHost]);

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

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

  const emitCanvasState = useCallback(
    debounce((pos, scale) => {
      if (isHost) {
        socketRef.current?.emit('canvasState', {
          whiteboardId,
          stagePos: pos,
          stageScale: scale,
        });
      }
    }, 50),
    [isHost, whiteboardId]
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorWithTimeout('Please log in to access the whiteboard');
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
      setErrorWithTimeout('Invalid session. Please log in again.');
      localStorage.removeItem('token');
      navigate('/');
    }
  }, [navigate, whiteboardId]);

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
        setErrorWithTimeout('Failed to load whiteboard');
        console.error('Load error:', err);
      }
    };

    loadWhiteboard();
  }, [whiteboardId]);

  useEffect(() => {
    if (!userEmail || !whiteboardId) return;

    socketRef.current = io(ENDPOINT, {
      query: { token: localStorage.getItem('token'), whiteboardId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log(`Socket connected for user: ${userEmail}, whiteboard: ${whiteboardId}`);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error(`Socket connection error for user: ${userEmail}, error:`, err);
      setErrorWithTimeout('Failed to connect to server. Retrying...');
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

    socketRef.current.on('canvasState', (data) => {
      if (!isHost) {
        setStagePos(data.stagePos);
        setStageScale(data.stageScale);
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
      setDrawingPermissions(prev => {
        if (prev[email] === canDraw) {
          console.log(`Skipped redundant permission update: email=${email}, canDraw=${canDraw}`);
          return prev;
        }
        console.log(`Permission updated: email=${email}, canDraw=${canDraw}`);
        return {
          ...prev,
          [email]: canDraw,
        };
      });
    });

    socketRef.current.on('sessionEnded', () => {
      if (!isHost) {
        setErrorWithTimeout('Session has been ended by the host');
        socketRef.current?.disconnect();
        navigate('/');
      }
    });

    socketRef.current.on('error', (message) => {
      setErrorWithTimeout(message);
      console.error('Socket error:', message);
    });

    return () => {
      socketRef.current?.disconnect();
      console.log(`Socket disconnected for user: ${userEmail}, whiteboard: ${whiteboardId}`);
    };
  }, [userEmail, whiteboardId, createdBy, isHost, navigate]);

  const grantPermission = (email) => {
    if (!isHost) {
      setErrorWithTimeout('Only the host can grant permissions');
      return;
    }
    socketRef.current?.emit('grantPermission', { whiteboardId, email });
  };

  const revokePermission = (email) => {
    if (!isHost) {
      setErrorWithTimeout('Only the host can revoke permissions');
      return;
    }
    socketRef.current?.emit('revokePermission', { whiteboardId, email });
  };

  const startDrawing = useCallback(() => {
    if (toolMode === 'pan') return;
    const pos = stageRef.current.getPointerPosition();
    if (!pos) return;

    if (isHost && activeLayerId !== 'layer-0') {
      setErrorWithTimeout('Host can only draw on Host Layer');
      return;
    }
    if (!isHost && activeLayerId !== 'layer-1') {
      setErrorWithTimeout('Guests can only draw on Guest Layer');
      return;
    }
    if (!hasDrawingPermission) {
      setErrorWithTimeout('You do not have permission to draw');
      return;
    }

    // Transform stage coordinates to canvas coordinates
    const canvasX = (pos.x - stagePos.x) / stageScale;
    const canvasY = (pos.y - stagePos.y) / stageScale;

    setIsDrawing(true);
    if (toolMode !== 'eraser') {
      setLayers(prev => prev.map(layer =>
        layer.id === activeLayerId ? {
          ...layer,
          lines: [...layer.lines, { points: [canvasX, canvasY], color, brushSize }],
        } : layer
      ));
    }
  }, [activeLayerId, color, brushSize, toolMode, isHost, hasDrawingPermission, stagePos, stageScale]);

  const drawOrErase = useCallback(() => {
    if (!isDrawing || toolMode === 'pan') return;
    
    const pos = stageRef.current.getPointerPosition();
    if (!pos) return;

    if (isHost && activeLayerId !== 'layer-0') {
      setErrorWithTimeout('Host can only draw on Host Layer');
      return;
    }
    if (!isHost && activeLayerId !== 'layer-1') {
      setErrorWithTimeout('Guests can only draw on Guest Layer');
      return;
    }
    if (!hasDrawingPermission) {
      setErrorWithTimeout('You do not have permission to draw');
      return;
    }

    // Transform stage coordinates to canvas coordinates
    const canvasX = (pos.x - stagePos.x) / stageScale;
    const canvasY = (pos.y - stagePos.y) / stageScale;

    setLayers(prev => {
      const newLayers = prev.map(layer => {
        if (layer.id !== activeLayerId) return layer;

        if (toolMode === 'eraser') {
          return {
            ...layer,
            lines: layer.lines.filter(line => {
              for (let i = 0; i < line.points.length; i += 2) {
                const x = line.points[i];
                const y = line.points[i + 1];
                const distance = Math.sqrt((canvasX - x) ** 2 + (canvasY - y) ** 2);
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
                ? { ...line, points: [...line.points, canvasX, canvasY] }
                : line
            ),
          };
        }
      });

      const activeLayer = newLayers.find(layer => layer.id === activeLayerId);
      emitDrawAction(activeLayerId, activeLayer?.lines || [], userEmail);

      return newLayers;
    });
  }, [isDrawing, toolMode, activeLayerId, brushSize, userEmail, emitDrawAction, isHost, hasDrawingPermission, stagePos, stageScale]);

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

  const handleWheel = useCallback((e) => {
    if (!isHost) return;
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = stageRef.current;
    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const boundedScale = Math.min(Math.max(0.5, newScale), 3);

    setStageScale(boundedScale);
    const newPos = {
      x: pointer.x - mousePointTo.x * boundedScale,
      y: pointer.y - mousePointTo.y * boundedScale,
    };
    setStagePos(newPos);

    emitCanvasState(newPos, boundedScale);
  }, [isHost, stageScale, stagePos, emitCanvasState]);

  const zoomIn = () => {
    if (!isHost) return;
    const scaleBy = 1.2;
    const stage = stageRef.current;
    const oldScale = stageScale;
    const center = {
      x: (window.innerWidth - 256) / 2,
      y: window.innerHeight / 2,
    };

    const mousePointTo = {
      x: (center.x - stagePos.x) / oldScale,
      y: (center.y - stagePos.y) / oldScale,
    };

    const newScale = oldScale * scaleBy;
    const boundedScale = Math.min(Math.max(0.5, newScale), 3);

    setStageScale(boundedScale);
    const newPos = {
      x: center.x - mousePointTo.x * boundedScale,
      y: center.y - mousePointTo.y * boundedScale,
    };
    setStagePos(newPos);

    emitCanvasState(newPos, boundedScale);
  };

  const zoomOut = () => {
    if (!isHost) return;
    const scaleBy = 1.2;
    const stage = stageRef.current;
    const oldScale = stageScale;
    const center = {
      x: (window.innerWidth - 256) / 2,
      y: window.innerHeight / 2,
    };

    const mousePointTo = {
      x: (center.x - stagePos.x) / oldScale,
      y: (center.y - stagePos.y) / oldScale,
    };

    const newScale = oldScale / scaleBy;
    const boundedScale = Math.min(Math.max(0.5, newScale), 3);

    setStageScale(boundedScale);
    const newPos = {
      x: center.x - mousePointTo.x * boundedScale,
      y: center.y - mousePointTo.y * boundedScale,
    };
    setStagePos(newPos);

    emitCanvasState(newPos, boundedScale);
  };

  const startPanning = useCallback(() => {
    if (!isHost || toolMode !== 'pan') return;
    setIsPanning(true);
    const pos = stageRef.current.getPointerPosition();
    lastPanPos.current = pos;
  }, [isHost, toolMode]);

  const panCanvas = useCallback(() => {
    if (!isPanning || !isHost || toolMode !== 'pan') return;
    const pos = stageRef.current.getPointerPosition();
    if (!pos || !lastPanPos.current) return;

    const dx = pos.x - lastPanPos.current.x;
    const dy = pos.y - lastPanPos.current.y;

    setStagePos(prev => {
      const newPos = {
        x: prev.x + dx,
        y: prev.y + dy,
      };
      emitCanvasState(newPos, stageScale);
      return newPos;
    });
    lastPanPos.current = pos;
  }, [isPanning, isHost, toolMode, stageScale, emitCanvasState]);

  const stopPanning = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      lastPanPos.current = null;
    }
  }, [isPanning]);

  const saveWhiteboard = async () => {
    if (realTimeCollaborationStarted) {
      if (!isHost) {
        toast.error('Only the host can save the whiteboard during collaboration mode.');
        return;
      }
    } else {
      if (userEmail !== createdBy) {
        toast.error('Only the creator can save the whiteboard when collaboration mode is off.');
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
        setErrorWithTimeout(null);
        toast.success('Whiteboard created successfully');
      } else {
        response = await axios.put(
          `${ENDPOINT}/board/${whiteboardId}`,
          { title, layers, creatorEmail: userEmail },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setErrorWithTimeout(null);
        toast.success('Whiteboard saved successfully');
      }
      return response.data;
    } catch (err) {
      setErrorWithTimeout('Failed to save whiteboard');
      console.error('Save error:', err);
      toast.error('Failed to save whiteboard');
    }
  };

  const handleInviteClick = async () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied to clipboard!');
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
      toast.success('Whiteboard created and invite link generated!');
    } catch (err) {
      setErrorWithTimeout('Failed to create whiteboard');
      console.error('Create error:', err);
      toast.error('Failed to create whiteboard');
    }
  };

  const clearCanvas = () => {
    if (realTimeCollaborationStarted && !isHost) {
      toast.error('Only the host can clear the layer in collaboration status mode');
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
    toast.success('Layer cleared successfully');
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
      setErrorWithTimeout('Only the host can end the session');
      return;
    }
    if (!realTimeCollaborationStarted) {
      setErrorWithTimeout('Session is not in collaboration mode');
      return;
    }

    try {
      await saveWhiteboard();
      socketRef.current?.emit('endSession', { whiteboardId });
      setRealTimeCollaborationStarted(false);
      setParticipants([participants.find(p => p.email === userEmail)]);
      setDrawingPermissions({ [userEmail]: true });
      setInviteLink('');
      setErrorWithTimeout(null);
      toast.success('Session ended and whiteboard saved');
      navigate('/dashboard');
    } catch (err) {
      setErrorWithTimeout('Failed to end session');
      console.error('End session error:', err);
      toast.error('Failed to end session');
    }
  };

  const isClearDisabled = realTimeCollaborationStarted && !isHost;
  const isSaveDisabled = realTimeCollaborationStarted ? !isHost : userEmail !== createdBy;
  const isEndSessionDisabled = !isHost || !realTimeCollaborationStarted;

  return (
    <div className="flex h-screen bg-gray-100">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />

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
            onClick={() => setToolMode('eraser')}
            className={`flex-1 p-2 rounded-md ${toolMode === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            disabled={!hasDrawingPermission}
          >
            <FontAwesomeIcon icon={faEraser} />
          </button>
          <button
            onClick={() => setToolMode('pencil')}
            className={`flex-1 p-2 rounded-md ${toolMode === 'pencil' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            disabled={!hasDrawingPermission}
          >
            <FontAwesomeIcon icon={faPencil} />
          </button>
          {isHost && (
            <button
              onClick={() => setToolMode('pan')}
              className={`flex-1 p-2 rounded-md ${toolMode === 'pan' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              <FontAwesomeIcon icon={faHandPaper} />
            </button>
          )}
        </div>

        {isHost && (
          <div className="flex gap-2">
            <button
              onClick={zoomIn}
              className="flex-1 p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              title="Zoom In"
            >
              <FontAwesomeIcon icon={faSearchPlus} />
            </button>
            <button
              onClick={zoomOut}
              className="flex-1 p-2 bg-gray-200 rounded-md hover:bg-gray-300"
              title="Zoom Out"
            >
              <FontAwesomeIcon icon={faSearchMinus} />
            </button>
          </div>
        )}

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

      <div className="flex-1 relative">
        {error && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
            {error}
            <button
              onClick={() => setErrorWithTimeout(null)}
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
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePos.x}
          y={stagePos.y}
          onMouseDown={toolMode === 'pan' ? startPanning : startDrawing}
          onMouseMove={toolMode === 'pan' ? panCanvas : drawOrErase}
          onMouseUp={toolMode === 'pan' ? stopPanning : stopDrawing}
          onTouchStart={toolMode === 'pan' ? startPanning : startDrawing}
          onTouchMove={toolMode === 'pan' ? panCanvas : drawOrErase}
          onTouchEnd={toolMode === 'pan' ? stopPanning : stopDrawing}
          onWheel={handleWheel}
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