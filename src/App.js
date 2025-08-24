import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { 
  FiCloud, FiSettings, FiBarChart2, FiUpload, FiPlay, FiPause,
  FiThermometer, FiDroplet, FiWind, FiSun, FiBattery, FiAlertCircle, FiDatabase,
  FiTrendingUp, FiActivity, FiFolder, FiFile, FiClock, FiMonitor, FiCpu,
  FiPlayCircle, FiPauseCircle, FiRotateCcw, FiCheckCircle,
  FiGlobe, FiLogIn, FiCalendar, FiDownload
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import apiService from './services/api';

// Styled Components with darker colors
const AppContainer = styled.div`
  min-height: 100vh;
  background: #0d1117;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Header = styled.header`
  background: #161b22;
  border-bottom: 1px solid #30363d;
  padding: 0 20px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CloudIcon = styled(FiCloud)`
  font-size: 24px;
  color: #1f6feb;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const NavButton = styled.button`
  background: ${props => props.active ? '#21262d' : 'transparent'};
  border: 1px solid ${props => props.active ? '#1f6feb' : '#30363d'};
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: #21262d;
    border-color: #1f6feb;
  }
`;

const LanguageToggle = styled.button`
  background: #21262d;
  border: 1px solid #30363d;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: #30363d;
    border-color: #1f6feb;
  }

  &:active {
    transform: scale(0.95);
  }
`;

// Settings Panel Components
const SettingsPanel = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: #161b22;
  border-left: 1px solid #30363d;
  padding: 20px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
`;

const SettingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #30363d;
`;

const SettingsTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SettingsCloseButton = styled.button`
  background: transparent;
  border: none;
  color: #8b949e;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: #30363d;
  }
`;

const SettingsSection = styled.div`
  margin-bottom: 25px;
`;

const SettingsSectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #1f6feb;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SensorUnitCard = styled.div`
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
`;

const SensorUnitName = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  margin-bottom: 8px;
`;

const UnitSelect = styled.select`
  background: #0d1117;
  border: 1px solid #30363d;
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1f6feb;
  }

  &:focus {
    outline: none;
    border-color: #1f6feb;
    box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.2);
  }
`;

const ConfigInput = styled.input`
  background: #0d1117;
  border: 1px solid #30363d;
  color: #fff;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  width: 100%;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1f6feb;
  }

  &:focus {
    outline: none;
    border-color: #1f6feb;
    box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.2);
  }

  &::placeholder {
    color: #8b949e;
  }
`;

const SettingsButton = styled.button`
  background: ${props => props.variant === 'secondary' ? '#30363d' : '#1f6feb'};
  border: 1px solid ${props => props.variant === 'secondary' ? '#30363d' : '#1f6feb'};
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  margin-right: 8px;

  &:hover {
    background: ${props => props.variant === 'secondary' ? '#40464d' : '#1158c7'};
    border-color: ${props => props.variant === 'secondary' ? '#40464d' : '#1158c7'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const MainContent = styled.div`
  height: calc(100vh - 80px);
`;

const ContentArea = styled.div`
  padding: 20px;
  overflow-y: auto;
  height: 100%;
`;

const SidebarSection = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: bold;
  color: #1f6feb;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlCard = styled.div`
  background: #21262d;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #30363d;
  margin-bottom: 15px;
`;

const CardTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Button = styled.button`
  background: #1f6feb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: #1158c7;
  }

  &:disabled {
    background: #30363d;
    color: #8b949e;
    cursor: not-allowed;
  }
`;

const FileCount = styled.div`
  font-size: 11px;
  color: #8b949e;
  margin-top: 8px;
`;

const StatusItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 11px;
`;

const StatusValue = styled.span`
  color: ${props => props.color};
  font-weight: bold;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${props => props.status === 'connected' ? '#1f6feb' : props.status === 'connecting' ? '#f59e0b' : '#dc2626'};
  font-weight: 500;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.status === 'connected' ? '#1f6feb' : props.status === 'connecting' ? '#f59e0b' : '#dc2626'};
  animation: ${props => props.status === 'connecting' ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const LogContainer = styled.div`
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  max-height: 150px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 11px;
`;

const LogEntry = styled.div`
  color: ${props => props.type === 'error' ? '#f85149' : props.type === 'success' ? '#238636' : '#8b949e'};
  margin-bottom: 2px;
`;

const DashboardView = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DashboardTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  color: #1f6feb;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DashboardSubtitle = styled.p`
  font-size: 14px;
  color: #8b949e;
  margin-top: 5px;
`;

const InteractiveControls = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const ControlButton = styled.button`
  background: ${props => props.active ? '#1f6feb' : '#21262d'};
  border: 1px solid #30363d;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? '#1158c7' : '#30363d'};
  }
`;



const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const SummaryCard = styled.div`
  background: #21262d;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #30363d;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const SummaryIcon = styled.div`
  font-size: 24px;
  color: #1f6feb;
`;

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SummaryValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #8b949e;
`;

const GraphsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const GraphCard = styled.div`
  background: #21262d;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #30363d;
`;

const GraphTitle = styled.h3`
  font-size: 14px;
  font-weight: bold;
  color: #1f6feb;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SensorPanels = styled.div`
  background: #21262d;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #30363d;
`;

const PanelTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: #1f6feb;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SensorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const InteractiveSensorCard = styled.div`
  background: ${props => props.selected ? '#1158c7' : '#161b22'};
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${props => props.selected ? '#1f6feb' : '#30363d'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.selected ? '#1158c7' : '#21262d'};
    border-color: #1f6feb;
  }
`;

const SensorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const SensorName = styled.div`
  font-size: 14px;
  font-weight: bold;
  color: #fff;
`;



const SensorValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #1f6feb;
  margin-bottom: 10px;
  text-align: center;
`;

const SensorUnit = styled.div`
  font-size: 12px;
  color: #8b949e;
  text-align: center;
  margin-bottom: 15px;
`;

const SensorTime = styled.div`
  font-size: 11px;
  color: #8b949e;
  text-align: center;
  margin-bottom: 15px;
  font-family: 'Courier New', monospace;
`;



const EnlargedGraphModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #0d1117;
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;







const HelpText = styled.div`
  font-size: 11px;
  color: #8b949e;
  margin-top: 5px;
  line-height: 1.4;
  font-style: italic;
`;

const SettingsStatus = styled.div`
  font-size: 12px;
  color: ${props => props.type === 'success' ? '#238636' : props.type === 'error' ? '#da3633' : '#8b949e'};
  margin-top: 10px;
  padding: 8px;
  background: ${props => props.type === 'success' ? 'rgba(35, 134, 54, 0.1)' : props.type === 'error' ? 'rgba(218, 54, 51, 0.1)' : 'transparent'};
  border-radius: 4px;
  border: 1px solid ${props => props.type === 'success' ? 'rgba(35, 134, 54, 0.3)' : props.type === 'error' ? 'rgba(218, 54, 51, 0.3)' : 'transparent'};
`;

const EnlargedGraphContent = styled.div`
  background: #0d1117;
  flex: 1;
  padding: 20px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #21262d;
  border: 1px solid #30363d;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #30363d;
  }
`;

const GraphStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #161b22;
  border-radius: 6px;
`;

const StatCard = styled.div`
  background: #21262d;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #8b949e;
`;

const ScrollableChartContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 10px;
  
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #0d1117;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #30363d;
    border-radius: 4px;
    
    &:hover {
      background: #1f6feb;
    }
  }
`;

const ChartWrapper = styled.div`
  min-width: ${props => Math.max(1200, props.dataLength * 3)}px; // Wider charts for full dataset
  height: 200px;
`;

// Library View Styled Components
const SearchFilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background: ${props => props.theme === 'light' ? '#ffffff' : '#161b22'};
  border: 1px solid ${props => props.theme === 'light' ? '#e1e4e8' : '#30363d'};
  border-radius: 8px;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 12px;
    color: #8b949e;
    z-index: 1;
  }
  
  input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    border: 1px solid #30363d;
    border-radius: 6px;
    background: #0d1117;
    color: #ffffff;
    font-size: 14px;
    
    &::placeholder {
      color: #8b949e;
    }
    
    &:focus {
      outline: none;
      border-color: #1f6feb;
      box-shadow: 0 0 0 3px rgba(31, 111, 235, 0.1);
    }
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TagFilter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  
  label {
    color: #ffffff;
    font-weight: 500;
    font-size: 14px;
  }
`;

const TagButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TagButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${props => props.active ? '#1f6feb' : '#30363d'};
  border-radius: 16px;
  background: ${props => props.active ? '#1f6feb' : 'transparent'};
  color: ${props => props.active ? '#ffffff' : '#8b949e'};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#1f6feb' : '#21262d'};
    border-color: ${props => props.active ? '#1f6feb' : '#8b949e'};
  }
`;

const LibraryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const LibraryStatCard = styled.div`
  padding: 20px;
  background: ${props => props.theme === 'light' ? '#ffffff' : '#161b22'};
  border: 1px solid ${props => props.theme === 'light' ? '#e1e4e8' : '#30363d'};
  border-radius: 8px;
  text-align: center;
`;

const LibraryStatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #1f6feb;
  margin-bottom: 5px;
`;

const LibraryStatLabel = styled.div`
  font-size: 14px;
  color: #8b949e;
`;

const LibraryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
`;

const LibraryCard = styled.div`
  padding: 20px;
  background: ${props => props.theme === 'light' ? '#ffffff' : '#161b22'};
  border: 1px solid ${props => props.theme === 'light' ? '#e1e4e8' : '#30363d'};
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    border-color: #1f6feb;
    box-shadow: 0 4px 12px rgba(31, 111, 235, 0.1);
  }
`;

const LibraryCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
`;

const FileIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #1f6feb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 18px;
`;

const FileInfo = styled.div`
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 5px;
  font-size: 16px;
`;

const FileMeta = styled.div`
  display: flex;
  gap: 8px;
  color: #8b949e;
  font-size: 12px;
  
  span {
    &:not(:last-child)::after {
      content: '•';
      margin-left: 8px;
    }
  }
`;

const FileActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${props => props.danger ? '#f85149' : '#30363d'};
  border-radius: 6px;
  background: ${props => props.danger ? '#f85149' : 'transparent'};
  color: ${props => props.danger ? '#ffffff' : '#8b949e'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.danger ? '#f85149' : '#21262d'};
    color: #ffffff;
  }
`;

const FileTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
`;

const Tag = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 12px;
  color: #8b949e;
  font-size: 12px;
`;

const RemoveTag = styled.button`
  background: none;
  border: none;
  color: #8b949e;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #f85149;
  }
`;

const AddTagSection = styled.div`
  input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #30363d;
    border-radius: 6px;
    background: #0d1117;
    color: #ffffff;
    font-size: 12px;
    
    &::placeholder {
      color: #8b949e;
    }
    
    &:focus {
      outline: none;
      border-color: #1f6feb;
    }
  }
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  color: #8b949e;
  
  svg {
    font-size: 48px;
    margin-bottom: 20px;
    color: #30363d;
  }
  
  h3 {
    margin-bottom: 10px;
    color: #ffffff;
  }
  
  p {
    font-size: 14px;
  }
`;

// Translations
const translations = {
  en: {
    dashboard: 'Dashboard',
    settings: 'Settings',
    library: 'Library',
    upload: 'Upload Files',
    process: 'Process Files',
    realTime: 'Real Time',
    stop: 'Stop',
    refresh: 'Refresh',
    clear: 'Clear Data',
    sensorIndex: 'Sensor Data',
    windSpeed: 'Wind Speed',
    windDirection: 'Wind Direction',
    temperature: 'Temperature',
    humidity: 'Humidity',
    pressure: 'Pressure',
    rainfall: 'Rainfall',
    solarCurrent: 'Solar Current',
    batteryVoltage: 'Battery Voltage',
    processing: 'Processing...',
    completed: 'Completed',
    error: 'Error',
    idle: 'Idle',
    totalRecords: 'Total Records',
    sensorCount: 'Sensor Count',
    fileCount: 'File Count',
    lastUpdate: 'Last Update',
    units: 'Units',
    language: 'Language',
    chartAnimations: 'Chart Animations',
    autoRefresh: 'Auto Refresh',
    expandChart: 'Expand Chart',
    collapseChart: 'Collapse Chart',
    selectSensors: 'Select Sensors',
    allSensors: 'All Sensors',
    noData: 'No data available',
    loading: 'Loading...',
    fileUploadSuccess: 'Files uploaded successfully',
    fileUploadError: 'Error uploading files',
    processingSuccess: 'Files processed successfully',
    processingError: 'Error processing files',
    selected: 'selected',
    processingLog: 'Processing Log',
    windRose: 'Wind Rose',
    temperatureTrend: 'Temperature Trend',
    humidityChart: 'Humidity Chart',
    pressureChart: 'Pressure Chart',
    rainfallChart: 'Rainfall Chart',
    solarChart: 'Solar Chart',
    batteryChart: 'Battery Chart',
    timeSlider: 'Time Navigation',
    applicationSettings: 'Application Settings',
    configureDataProcessing: 'Configure data processing and visualization options',
    realTimeSettings: 'Real-time Settings',
    refreshInterval: 'Refresh Interval (seconds)',
    displaySettings: 'Display Settings',
    theme: 'Theme',
    fileProcessingSettings: 'File Processing Settings',
    autoProcessRLD: 'Auto-process RLD files',
    generateCSV: 'Generate CSV output',
    saveProcessedFiles: 'Save processed files',
    historicalDataLibrary: 'Historical Data Library',
    browsePastData: 'Browse and analyze past RLD data files',
    totalFiles: 'Total Files',
    dataRange: 'Data Range',
    sensorTypes: 'Sensor Types',
    recentFiles: 'Recent Files',
    dataStatistics: 'Data Statistics',
    averageTemperature: 'Average Temperature',
    averageWindSpeed: 'Average Wind Speed',
    totalRainfall: 'Total Rainfall',
    peakSolarCurrent: 'Peak Solar Current',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    records: 'records',
    closeAnalysisWindow: 'Close Analysis Window',
    fullScreenAnalysis: 'Full Screen Analysis',
    timeRange: 'Time Range',
    resetRange: 'Reset Range',
    totalDataPoints: 'Total Data Points',
    startDate: 'Start Date',
    endDate: 'End Date',
    duration: 'Duration',
    totalMinutes: 'Total Minutes',
    readingsPerHour: 'Readings/Hour',
    dataExportFormat: 'Data Export Format',
    chartType: 'Chart Type',
    sensorUnits: 'Sensor Units',
    exportData: 'Export Data',
    searchFiles: 'Search files...',
    importData: 'Import Data',
    backupData: 'Backup Data',
    restoreData: 'Restore Data',
    dataQuality: 'Data Quality',
    dataValidation: 'Data Validation',
    alerts: 'Alerts',
    notifications: 'Notifications',
    help: 'Help',
    documentation: 'Documentation',
    about: 'About',
    version: 'Version',
    contact: 'Contact',
    support: 'Support',
    feedback: 'Feedback',
    reportBug: 'Report Bug',
    featureRequest: 'Feature Request',
    // New translation keys for all interface elements
    nrgDataSense: 'DataSense',
    dataVisualizer: 'Data Visualizer',
    rldFileProcessing: 'File Processing',
    systemStatus: 'System Status',
    sensorDataDashboard: 'Sensor Data Dashboard',
    realTimeVisualizationSubtitle: 'Real-time visualization of RLD sensor data from the last 24 hours',
    pdfReport: 'PDF Report',
    generatePdfReport: 'Generate PDF Report',
    windDirection: 'Wind Direction',
    readings: 'readings',
    first: 'First',
    last: 'Last',
    currentValues: 'Current Values',
    files: 'files',
    active: 'Active',
    idle: 'Idle',
    noDataAvailable: 'No Data Available',
    processingStatus: 'Processing Status',
    processingCompleted: 'Processing Completed',
    processingError: 'Processing Error',
    sensorDataAnalysis: 'Sensor Data Analysis',
    sensorDataAnalysisContinued: 'Sensor Data Analysis (Continued)',
    environmentalDataAnalysis: 'Environmental Data Analysis',
    page1Of2: 'Page 1 of 2',
    page2Of2: 'Page 2 of 2',
    sensorDataAnalysisReport: 'Sensor Data Analysis Report',
    generated: 'Generated',
    file: 'File',
    records: 'Records',
    sensor: 'Sensor',
    average: 'Average',
    max: 'Max',
    lowest: 'Lowest',
    unit: 'Unit',
    keyMetrics: 'Key Metrics',
    keyMetricsVisualization: 'Key Metrics Visualization',
    nrgReport: 'DataSense Report',
    environmentalDataAnalysisReport: 'Environmental Data Analysis Report',
    // Status messages
    startingRealRldFileProcessing: 'Starting real RLD file processing...',
    processingRldFile: 'Processing RLD file',
    fileSize: 'File size',
    characters: 'characters',
    foundDataLines: 'Found data lines in',
    sampleLinesFrom: 'Sample lines from',
    line: 'Line',
    parsedPartsFromLine: 'Parsed parts from line',
    successfullyParsedValidRecords: 'Successfully parsed valid records from',
    convertingUnifiedDataToCsv: 'Converting unified data to CSV format...',
    automaticallyLoadingCsvData: 'Automatically loading CSV data for visualization...',
    successfullyUnifiedRldFiles: 'Successfully unified files into CSV with total records',
    csvFileDownloadedAutomatically: 'CSV file downloaded automatically',
    dataAutomaticallyLoaded: 'Data automatically loaded and visualized in charts',
    dataSavedToLibrary: 'Data saved to library for future access',
    rldUnificationFailed: 'RLD unification failed',
    errorProcessingRldFiles: 'Error processing RLD files',
    errorParsingLine: 'Error parsing line',
    in: 'in',
    loadedLibraryFile: 'Loaded library file',
    libraryFileDeleted: 'Library file deleted',
    autoCleanupRemovedFiles: 'Auto-cleanup: Removed files older than 1 year',
    noOldFilesToCleanUp: 'No old files to clean up',
    pdfReportGenerated: 'PDF report generated',
    activeSensors: 'Active Sensors',
    dataPoints: 'Data Points',
    with: 'with',
    totalRecords: 'Total Records',
    fullScreenAnalysis: 'Full Screen Analysis',
    closeAnalysisWindow: 'Close Analysis Window',
    settings: 'Settings',
    save: 'Save',
    reset: 'Reset',
    cancel: 'Cancel',
    // NRG API Configuration translations

    allFiles: 'All Files',
    startDate: 'Start Date',
    endDate: 'End Date',
    startDatePlaceholder: 'e.g., 2024-01-01',
    endDatePlaceholder: 'e.g., 2024-12-31',
    // Folder selection translations

    folderSelection: 'Folder Selection',
    selectUpToTenFiles: 'Select up to 10 files to process',
    selectedFiles: 'Selected Files',
    noFilesSelected: 'No files selected',
    processSelectedFiles: 'Process Selected Files',

    timestamp: 'Timestamp',
    fileName: 'File Name',
    fileSize: 'File Size',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',

    folderProcessed: 'Folder processed successfully',
    convertingRldToTxt: 'Converting RLD to TXT...',
    convertingTxtToCsv: 'Converting TXT to CSV...',
    readyForSelection: 'Ready for file selection',
    // File filter explanations

  },
  'es-DO': {
    dashboard: 'Panel Principal',
    settings: 'Configuración',
    library: 'Biblioteca',
    upload: 'Subir Archivos',
    process: 'Procesar Archivos',
    realTime: 'Tiempo Real',
    stop: 'Detener',
    refresh: 'Actualizar',
    clear: 'Limpiar Datos',
    sensorIndex: 'Datos de Sensores',
    windSpeed: 'Velocidad del Viento',
    windDirection: 'Dirección del Viento',
    temperature: 'Temperatura',
    humidity: 'Humedad',
    pressure: 'Presión',
    rainfall: 'Lluvia',
    solarCurrent: 'Corriente Solar',
    batteryVoltage: 'Voltaje de Batería',
    processing: 'Procesando...',
    completed: 'Completado',
    error: 'Error',
    idle: 'Inactivo',
    totalRecords: 'Registros Totales',
    sensorCount: 'Conteo de Sensores',
    fileCount: 'Conteo de Archivos',
    lastUpdate: 'Última Actualización',
    units: 'Unidades',
    language: 'Idioma',
    chartAnimations: 'Animaciones de Gráficos',
    autoRefresh: 'Actualización Automática',
    expandChart: 'Expandir Gráfico',
    collapseChart: 'Contraer Gráfico',
    selectSensors: 'Seleccionar Sensores',
    allSensors: 'Todos los Sensores',
    noData: 'No hay datos disponibles',
    loading: 'Cargando...',
    fileUploadSuccess: 'Archivos subidos exitosamente',
    fileUploadError: 'Error al subir archivos',
    processingSuccess: 'Archivos procesados exitosamente',
    processingError: 'Error al procesar archivos',
    selected: 'seleccionados',
    processingLog: 'Registro de Procesamiento',
    windRose: 'Rosa de Vientos',
    temperatureTrend: 'Tendencia de Temperatura',
    humidityChart: 'Gráfico de Humedad',
    pressureChart: 'Gráfico de Presión',
    rainfallChart: 'Gráfico de Lluvia',
    solarChart: 'Gráfico Solar',
    batteryChart: 'Gráfico de Batería',
    timeSlider: 'Navegación de Tiempo',
    applicationSettings: 'Configuración de la Aplicación',
    configureDataProcessing: 'Configurar opciones de procesamiento y visualización de datos',
    realTimeSettings: 'Configuración de Tiempo Real',
    refreshInterval: 'Intervalo de Actualización (segundos)',
    displaySettings: 'Configuración de Pantalla',
    theme: 'Tema',
    fileProcessingSettings: 'Configuración de Procesamiento de Archivos',
    autoProcessRLD: 'Procesar automáticamente archivos RLD',
    generateCSV: 'Generar salida CSV',
    saveProcessedFiles: 'Guardar archivos procesados',
    historicalDataLibrary: 'Biblioteca de Datos Históricos',
    browsePastData: 'Explorar y analizar archivos RLD pasados',
    totalFiles: 'Archivos Totales',
    dataRange: 'Rango de Datos',
    sensorTypes: 'Tipos de Sensores',
    recentFiles: 'Archivos Recientes',
    dataStatistics: 'Estadísticas de Datos',
    averageTemperature: 'Temperatura Promedio',
    averageWindSpeed: 'Velocidad Promedio del Viento',
    totalRainfall: 'Lluvia Total',
    peakSolarCurrent: 'Corriente Solar Máxima',
    today: 'Hoy',
    yesterday: 'Ayer',
    daysAgo: 'días atrás',
    records: 'registros',
    closeAnalysisWindow: 'Cerrar Ventana de Análisis',
    fullScreenAnalysis: 'Análisis de Pantalla Completa',
    timeRange: 'Rango de Tiempo',
    resetRange: 'Restablecer Rango',
    totalDataPoints: 'Puntos de Datos Totales',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    duration: 'Duración',
    totalMinutes: 'Minutos Totales',
    readingsPerHour: 'Lecturas/Hora',
    dataExportFormat: 'Formato de Exportación de Datos',
    chartType: 'Tipo de Gráfico',
    sensorUnits: 'Unidades de Sensores',
    exportData: 'Exportar Datos',
    searchFiles: 'Buscar archivos...',
    importData: 'Importar Datos',
    backupData: 'Respaldar Datos',
    restoreData: 'Restaurar Datos',
    dataQuality: 'Calidad de Datos',
    dataValidation: 'Validación de Datos',
    alerts: 'Alertas',
    notifications: 'Notificaciones',
    help: 'Ayuda',
    documentation: 'Documentación',
    about: 'Acerca de',
    version: 'Versión',
    contact: 'Contacto',
    support: 'Soporte',
    feedback: 'Comentarios',
    reportBug: 'Reportar Error',
    featureRequest: 'Solicitar Función',
    // New translation keys for all interface elements
    nrgDataSense: 'DataSense',
    rldDataVisualizer: 'Visualizador de Datos RLD',
    rldFileProcessing: 'Procesamiento de Archivos',
    systemStatus: 'Estado del Sistema',
    sensorDataDashboard: 'Panel de Datos de Sensores',
    realTimeVisualizationSubtitle: 'Visualización en tiempo real de datos de sensores RLD de las últimas 24 horas',
    pdfReport: 'Reporte PDF',
    generatePdfReport: 'Generar Reporte PDF',
    windDirection: 'Dirección del Viento',
    readings: 'lecturas',
    first: 'Primero',
    last: 'Último',
    currentValues: 'Valores Actuales',
    files: 'archivos',
    active: 'Activo',
    idle: 'Inactivo',
    noDataAvailable: 'No hay datos disponibles',
    processingStatus: 'Estado de Procesamiento',
    processingCompleted: 'Procesamiento Completado',
    processingError: 'Error de Procesamiento',
    sensorDataAnalysis: 'Análisis de Datos de Sensores',
    sensorDataAnalysisContinued: 'Análisis de Datos de Sensores (Continuado)',
    environmentalDataAnalysis: 'Análisis de Datos Ambientales',
    page1Of2: 'Página 1 de 2',
    page2Of2: 'Página 2 de 2',
    sensorDataAnalysisReport: 'Reporte de Análisis de Datos de Sensores',
    generated: 'Generado',
    file: 'Archivo',
    records: 'Registros',
    sensor: 'Sensor',
    average: 'Promedio',
    max: 'Máximo',
    lowest: 'Mínimo',
    unit: 'Unidad',
    keyMetrics: 'Métricas Clave',
    keyMetricsVisualization: 'Visualización de Métricas Clave',
    nrgReport: 'Reporte DataSense',
    environmentalDataAnalysisReport: 'Reporte de Análisis de Datos Ambientales',
    // Status messages
    startingRealRldFileProcessing: 'Iniciando procesamiento real de archivos RLD...',
    processingRldFile: 'Procesando archivo RLD',
    fileSize: 'Tamaño del archivo',
    characters: 'caracteres',
    foundDataLines: 'Líneas de datos encontradas en',
    sampleLinesFrom: 'Líneas de muestra de',
    line: 'Línea',
    parsedPartsFromLine: 'Partes analizadas de la línea',
    successfullyParsedValidRecords: 'Registros válidos analizados exitosamente de',
    convertingUnifiedDataToCsv: 'Convirtiendo datos unificados a formato CSV...',
    automaticallyLoadingCsvData: 'Cargando automáticamente datos CSV para visualización...',
    successfullyUnifiedRldFiles: 'Archivos unificados exitosamente en CSV con registros totales',
    csvFileDownloadedAutomatically: 'Archivo CSV descargado automáticamente',
    dataAutomaticallyLoaded: 'Datos cargados y visualizados automáticamente en gráficos',
    dataSavedToLibrary: 'Datos guardados en biblioteca para acceso futuro',
    rldUnificationFailed: 'Unificación RLD falló',
    errorProcessingRldFiles: 'Error procesando archivos RLD',
    errorParsingLine: 'Error analizando línea',
    in: 'en',
    loadedLibraryFile: 'Archivo de biblioteca cargado',
    libraryFileDeleted: 'Archivo de biblioteca eliminado',
    autoCleanupRemovedFiles: 'Limpieza automática: Archivos eliminados de más de 1 año',
    noOldFilesToCleanUp: 'No hay archivos antiguos para limpiar',
    pdfReportGenerated: 'Reporte PDF generado',
    activeSensors: 'Sensores Activos',
    dataPoints: 'Puntos de Datos',
    with: 'con',
    totalRecords: 'Registros Totales',
    fullScreenAnalysis: 'Análisis de Pantalla Completa',
    closeAnalysisWindow: 'Cerrar Ventana de Análisis',
    // NRG API Configuration translations

    allFiles: 'Todos los Archivos',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    startDatePlaceholder: 'ej., 2024-01-01',
    endDatePlaceholder: 'ej., 2024-12-31',
    // Folder selection translations

    folderSelection: 'Selección de Carpeta',
    selectUpToTenFiles: 'Seleccione hasta 10 archivos para procesar',
    selectedFiles: 'Archivos Seleccionados',
    noFilesSelected: 'No hay archivos seleccionados',
    processSelectedFiles: 'Procesar Archivos Seleccionados',

    timestamp: 'Marca de Tiempo',
    fileName: 'Nombre del Archivo',
    fileSize: 'Tamaño del Archivo',
    selectAll: 'Seleccionar Todos',
    deselectAll: 'Deseleccionar Todos',

    folderProcessed: 'Carpeta procesada exitosamente',
    convertingRldToTxt: 'Convirtiendo RLD a TXT...',
    convertingTxtToCsv: 'Convirtiendo TXT a CSV...',
    readyForSelection: 'Listo para selección de archivos',
    // File filter explanations

  }
};

const App = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [language, setLanguage] = useState('en');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [realTimeData, setRealTimeData] = useState([]);
  const [processingLog, setProcessingLog] = useState([]);
  const [timeIndex, setTimeIndex] = useState(0);
  const [hasData, setHasData] = useState(false);
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [selectedLibraryFile, setSelectedLibraryFile] = useState(null);
  const [enlargedGraph, setEnlargedGraph] = useState(null);
  const [analysisTimeRange, setAnalysisTimeRange] = useState({ start: 0, end: 0 });
  const [pdfReportTimeRange, setPdfReportTimeRange] = useState({ start: 0, end: 0 });
  const [settings, setSettings] = useState({
    dataExportFormat: 'csv',
    autoProcessRLD: true,
    generateCSV: true,
    saveProcessedFiles: true,
    refreshInterval: 30,
    theme: 'dark',
    chartAnimations: true
  });

  // Sensor Unit Settings
  const [sensorUnits, setSensorUnits] = useState({
    'NRG_40C_Anem': 'm/s',
    'NRG_200M_Vane': 'degrees',
    'NRG_T60_Temp': '°C',
    'NRG_RH5X_Humi': '%',
    'NRG_BP60_Baro': 'hPa',
    'Rain_Gauge': 'mm',
    'PSM_c_Si_Isc_Soil': 'A',
    'PSM_c_Si_Isc_Clean': 'A',
    'Average_12V_Battery': 'V'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const [backendStatus, setBackendStatus] = useState('connecting');

  // Email configuration state
  const [emailConfig, setEmailConfig] = useState({
    enabled: false,
    smtpServer: '',
    smtpPort: 587,
    username: '',
    password: '',
    recipientEmail: '',
    subject: 'NRG DataSense Report'
  });

  
  // Settings save status
  const [settingsSaveStatus, setSettingsSaveStatus] = useState({ type: '', message: '' });


  // Check backend status
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        // Set connecting status while checking
        setBackendStatus('connecting');
        
        const response = await fetch(`https://nrg-datasense-backend.onrender.com/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const healthData = await response.json();
          setBackendStatus('connected');
          console.log('✅ Backend connected successfully:', healthData);
        } else {
          setBackendStatus('error');
          console.log('❌ Backend health check failed:', response.status);
        }
      } catch (error) {
        console.error('Backend connection error:', error);
        
        // More specific error handling
        if (error.name === 'AbortError') {
          console.log('⏰ Backend connection timeout - service may be starting up');
          setBackendStatus('connecting'); // Keep trying if it's a timeout
        } else if (error.message.includes('Failed to fetch')) {
          console.log('🌐 Backend not reachable - may not be deployed yet');
          setBackendStatus('error');
        } else {
          setBackendStatus('error');
        }
      }
    };

    // Use permanent backend URL
    console.log('🔍 Checking backend connection at: https://nrg-datasense-backend.onrender.com');
    checkBackendStatus();
    
    // Check more frequently initially, then every 30 seconds
    const initialInterval = setInterval(checkBackendStatus, 5000); // Check every 5 seconds initially
    setTimeout(() => {
      clearInterval(initialInterval);
      const regularInterval = setInterval(checkBackendStatus, 30000); // Then every 30 seconds
      return () => clearInterval(regularInterval);
    }, 60000); // After 1 minute, switch to regular interval
    
    return () => clearInterval(initialInterval);
  }, []);

  // Load email configuration from localStorage
  useEffect(() => {
    const savedEmailConfig = localStorage.getItem('datasenseEmailConfig');
    if (savedEmailConfig) {
      try {
        const config = JSON.parse(savedEmailConfig);
        setEmailConfig(config);
      } catch (error) {
        console.error('Error loading email config:', error);
      }
    }
  }, []);







  // Load library files from localStorage and backend on app start
  useEffect(() => {
    const loadFiles = async () => {
      // Load local files
      const savedFiles = localStorage.getItem('datasenseLibraryFiles');
      let localFiles = [];
      
      if (savedFiles) {
        const files = JSON.parse(savedFiles);
        
        // Clean old data (older than 1 year)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const currentTime = new Date();
        const cleanedFiles = files.filter(file => {
          const fileDate = new Date(file.date);
          const isOlderThanOneYear = fileDate < oneYearAgo;
          
          if (isOlderThanOneYear) {
            console.log(`Auto-deleting old file: ${file.name} (${fileDate.toLocaleDateString()})`);
          }
          
          return !isOlderThanOneYear;
        });
        
        // Update localStorage with cleaned data
        if (cleanedFiles.length !== files.length) {
          localStorage.setItem('datasenseLibraryFiles', JSON.stringify(cleanedFiles));
          console.log(`Auto-cleanup: Removed ${files.length - cleanedFiles.length} old files`);
        }
        
        localFiles = cleanedFiles;
      }
      
      // Load backend files
      try {
        const backendResponse = await apiService.getFileMetadata();
        const backendFiles = backendResponse.files.map(file => ({
          id: `backend-${file.filename}`,
          name: file.filename,
          date: file.timestamp,
          records: file.records_added,
          size: file.file_size,
          processingDate: file.processing_date,
          status: file.status,
          source: 'backend',
          tags: []
        }));
        
        // Combine local and backend files
        const allFiles = [...localFiles, ...backendFiles];
        setLibraryFiles(allFiles);
        
        // Extract all unique tags
        const allTags = new Set();
        allFiles.forEach(file => {
          if (file.tags && Array.isArray(file.tags)) {
            file.tags.forEach(tag => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags));
        
      } catch (error) {
        console.log('Backend not available, using local files only');
        setLibraryFiles(localFiles);
        
        // Extract tags from local files only
        const allTags = new Set();
        localFiles.forEach(file => {
          if (file.tags && Array.isArray(file.tags)) {
            file.tags.forEach(tag => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags));
      }
    };
    
    loadFiles();
  }, []);





  // Save library files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('datasenseLibraryFiles', JSON.stringify(libraryFiles));
  }, [libraryFiles]);

  // Apply theme changes
  useEffect(() => {
    setCurrentTheme(settings.theme);
    document.body.style.backgroundColor = settings.theme === 'light' ? '#ffffff' : '#0d1117';
    document.body.style.color = settings.theme === 'light' ? '#000000' : '#ffffff';
  }, [settings.theme]);

  const [libraryData, setLibraryData] = useState({
    files: [
      { name: 'station_2024_07_29.rld', records: 1247, date: 'today' },
      { name: 'station_2024_07_28.rld', records: 1440, date: 'yesterday' },
      { name: 'station_2024_07_27.rld', records: 1440, date: '2 days ago' }
    ],
    totalRecords: 4127,
    dateRange: { start: '2024-07-27', end: '2024-07-29' }
  });
  
  const [summary, setSummary] = useState({
    totalRecords: 0,
    sensorCount: 0,
    fileCount: 0,
    lastUpdate: new Date().toLocaleTimeString()
  });



  // Translation helper
  const t = (key) => translations[language][key] || key;

  // Sensor unit configuration
  const sensorUnitOptions = {
    'NRG_40C_Anem': ['m/s', 'km/h', 'mph', 'knots'],
    'NRG_200M_Vane': ['degrees', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
    'NRG_T60_Temp': ['°C', '°F', 'K'],
    'NRG_RH5X_Humi': ['%', 'decimal'],
    'NRG_BP60_Baro': ['hPa', 'Pa', 'mmHg', 'inHg'],
    'Rain_Gauge': ['mm', 'in', 'cm'],
    'PSM_c_Si_Isc_Soil': ['A', 'mA'],
    'PSM_c_Si_Isc_Clean': ['A', 'mA'],
    'Average_12V_Battery': ['V', 'mV']
  };

  const handleUnitChange = (sensorName, newUnit) => {
    setSensorUnits(prev => ({
      ...prev,
      [sensorName]: newUnit
    }));
    addLogEntry(`Unit changed for ${sensorName}: ${newUnit}`, 'info');
  };

  const resetToDefaults = () => {
    const defaultUnits = {
      'NRG_40C_Anem': 'm/s',
      'NRG_200M_Vane': 'degrees',
      'NRG_T60_Temp': '°C',
      'NRG_RH5X_Humi': '%',
      'NRG_BP60_Baro': 'hPa',
      'Rain_Gauge': 'mm',
      'PSM_c_Si_Isc_Soil': 'A',
      'PSM_c_Si_Isc_Clean': 'A',
      'Average_12V_Battery': 'V'
    };
    setSensorUnits(defaultUnits);
    
    addLogEntry('Sensor units reset to defaults', 'info');
  };

  const saveSettings = async () => {
    try {
      // Save sensor units to localStorage only
      localStorage.setItem('datasenseSensorUnits', JSON.stringify(sensorUnits));
      
      setSettingsSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
      addLogEntry('Sensor units saved successfully', 'success');
      
      // Clear status after 3 seconds
      setTimeout(() => {
        setSettingsSaveStatus({ type: '', message: '' });
      }, 3000);
      
    } catch (error) {
      setSettingsSaveStatus({ type: 'error', message: 'Error saving settings: ' + error.message });
      addLogEntry('Error saving settings: ' + error.message, 'error');
    }
  };

  // Load sensor units from localStorage
  useEffect(() => {
    const savedUnits = localStorage.getItem('datasenseSensorUnits');
    if (savedUnits) {
      setSensorUnits(JSON.parse(savedUnits));
    }
  }, []);

  // Add log entry
  const addLogEntry = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setProcessingLog(prev => [...prev, { timestamp, message, type }]);
  };

  // Initialize with no data
  useEffect(() => {
    addLogEntry('Application started - No data available', 'info');
    setRealTimeData([]);
    setHasData(false);
    setSummary({
      totalRecords: 0,
      sensorCount: 0,
      fileCount: 0,
      lastUpdate: new Date().toLocaleTimeString()
    });
    

  }, []);
  




  const getSensorDisplayName = (sensorName) => {
    const names = {
      'NRG_40C_Anem': language === 'en' ? 'Wind Speed (Anemometer)' : 'Velocidad del Viento (Anemómetro)',
      'NRG_200M_Vane': language === 'en' ? 'Wind Direction (Vane)' : 'Dirección del Viento (Veleta)',
      'NRG_T60_Temp': language === 'en' ? 'Air Temperature' : 'Temperatura del Aire',
      'NRG_RH5X_Humi': language === 'en' ? 'Relative Humidity' : 'Humedad Relativa',
      'NRG_BP60_Baro': language === 'en' ? 'Barometric Pressure' : 'Presión Barométrica',
      'Rain_Gauge': language === 'en' ? 'Precipitation' : 'Precipitación',
      'NRG_PVT1_PV_Temp': language === 'en' ? 'PV Temperature' : 'Temperatura PV',
      'PSM_c_Si_Isc_Soil': language === 'en' ? 'Solar Current (Soil)' : 'Corriente Solar (Suelo)',
      'PSM_c_Si_Isc_Clean': language === 'en' ? 'Solar Current (Clean)' : 'Corriente Solar (Limpia)',
      'Average_12V_Battery': language === 'en' ? 'Battery Voltage' : 'Voltaje de Batería',
      // SymphoniePRO sensor mappings
      'Ch1_Anem_0.00m_N_Avg_m/s': 'Wind Speed (Avg)',
      'Ch1_Anem_0.00m_N_Max_m/s': 'Wind Speed (Max)',
      'Ch1_Anem_0.00m_N_Gust_m/s': 'Wind Speed (Gust)',
      'Ch13_Vane_0.00m_N_Avg_Deg': 'Wind Direction (Avg)',
      'Ch13_Vane_0.00m_N_GustDir_Deg': 'Wind Direction (Gust)',
      'Ch14_Analog_0.00m_N_Avg_C': 'Temperature (Avg)',
      'Ch14_Analog_0.00m_N_Max_C': 'Temperature (Max)',
      'Ch16_Analog_0.00m_N_Avg_%RH': 'Humidity (Avg)',
      'Ch16_Analog_0.00m_N_Max_%RH': 'Humidity (Max)',
      'Ch17_Analog_0.00m_N_Avg_hPa': 'Pressure (Avg)',
      'Ch17_Analog_0.00m_N_Max_hPa': 'Pressure (Max)',
      'Ch4_Total_0.00m_N_Sum_mm': 'Rainfall (Total)',
      'Ch24_Analog_0.00m_N_Avg_W/m2': 'Solar Radiation (Avg)',
      'Ch24_Analog_0.00m_N_Max_W/m2': 'Solar Radiation (Max)',
      'Ch25_Analog_0.00m_N_Avg_W/m2': 'Solar Radiation 2 (Avg)',
      'Ch25_Analog_0.00m_N_Max_W/m2': 'Solar Radiation 2 (Max)',
      'Ch26_Analog_0.00m_N_Avg_W/m2': 'Solar Radiation 3 (Avg)',
      'Ch26_Analog_0.00m_N_Max_W/m2': 'Solar Radiation 3 (Max)'
    };
    return names[sensorName] || sensorName;
  };

  // Parse SymphoniePRO TXT file
  const parseSymphoniePROFile = async (fileContent, fileName) => {
    addLogEntry(`Parsing SymphoniePRO file: ${fileName}`, 'info');
    
    const lines = fileContent.split('\n');
    let dataStartIndex = -1;
    let headers = [];
    let sensorMappings = {};
    
    // Find the data section and headers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for the Timestamp header line
      if (line.startsWith('Timestamp')) {
        dataStartIndex = i + 1;
        headers = line.split('\t').map(h => h.trim());
        
        // Create sensor mappings for SymphoniePRO format
        sensorMappings = {
          'NRG_40C_Anem': headers.findIndex(h => h.includes('Ch1_Anem') && h.includes('Avg_m/s')),
          'NRG_200M_Vane': headers.findIndex(h => h.includes('Ch13_Vane') && h.includes('Avg_Deg')),
          'NRG_T60_Temp': headers.findIndex(h => h.includes('Ch14_Analog') && h.includes('Avg_C')),
          'NRG_RH5X_Humi': headers.findIndex(h => h.includes('Ch16_Analog') && h.includes('Avg_%RH')),
          'NRG_BP60_Baro': headers.findIndex(h => h.includes('Ch17_Analog') && h.includes('Avg_hPa')),
          'Rain_Gauge': headers.findIndex(h => h.includes('Ch4_Total') && h.includes('Sum_mm')),
          'NRG_PVT1_PV_Temp': headers.findIndex(h => h.includes('Ch21_Therm') && h.includes('Avg_C')),
          'PSM_c_Si_Isc_Soil': headers.findIndex(h => h.includes('Ch22_Analog') && h.includes('Avg_A')),
          'PSM_c_Si_Isc_Clean': headers.findIndex(h => h.includes('Ch23_Analog') && h.includes('Avg_A')),
          'Average_12V_Battery': headers.findIndex(h => h.includes('Ch20_Analog') && h.includes('Avg_hPa'))
        };
        
        addLogEntry(`Found ${headers.length} columns in SymphoniePRO data`, 'info');
        addLogEntry(`Headers: ${headers.slice(0, 10).join(', ')}...`, 'info');
        break;
      }
    }
    
    if (dataStartIndex === -1) {
      addLogEntry('Could not find data section in SymphoniePRO file', 'error');
      return [];
    }
    
    const fileData = [];
    let validRecords = 0;
    
    // Parse data rows
    for (let i = dataStartIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      try {
        // Split by tabs (SymphoniePRO format uses tab separation)
        const parts = line.split('\t').map(part => part.trim());
        
        if (parts.length >= headers.length) {
          // Parse timestamp
          const timestampStr = parts[0];
          const timestamp = new Date(timestampStr);
          
          if (isNaN(timestamp.getTime())) {
            addLogEntry(`Invalid timestamp at line ${i + 1}: ${timestampStr}`, 'error');
            continue;
          }
          
          // Create data point with mapped sensors
          const dataPoint = {
            time: timestamp.toLocaleTimeString(),
            timestamp: timestamp.toISOString(),
            NRG_40C_Anem: sensorMappings.NRG_40C_Anem >= 0 ? parseFloat(parts[sensorMappings.NRG_40C_Anem]) || 0 : 0,
            NRG_200M_Vane: sensorMappings.NRG_200M_Vane >= 0 ? parseFloat(parts[sensorMappings.NRG_200M_Vane]) || 0 : 0,
            NRG_T60_Temp: sensorMappings.NRG_T60_Temp >= 0 ? parseFloat(parts[sensorMappings.NRG_T60_Temp]) || 0 : 0,
            NRG_RH5X_Humi: sensorMappings.NRG_RH5X_Humi >= 0 ? parseFloat(parts[sensorMappings.NRG_RH5X_Humi]) || 0 : 0,
            NRG_BP60_Baro: sensorMappings.NRG_BP60_Baro >= 0 ? parseFloat(parts[sensorMappings.NRG_BP60_Baro]) || 0 : 0,
            Rain_Gauge: sensorMappings.Rain_Gauge >= 0 ? parseFloat(parts[sensorMappings.Rain_Gauge]) || 0 : 0,
            NRG_PVT1_PV_Temp: sensorMappings.NRG_PVT1_PV_Temp >= 0 ? parseFloat(parts[sensorMappings.NRG_PVT1_PV_Temp]) || 0 : 0,
            PSM_c_Si_Isc_Soil: sensorMappings.PSM_c_Si_Isc_Soil >= 0 ? parseFloat(parts[sensorMappings.PSM_c_Si_Isc_Soil]) || 0 : 0,
            PSM_c_Si_Isc_Clean: sensorMappings.PSM_c_Si_Isc_Clean >= 0 ? parseFloat(parts[sensorMappings.PSM_c_Si_Isc_Clean]) || 0 : 0,
            Average_12V_Battery: sensorMappings.Average_12V_Battery >= 0 ? parseFloat(parts[sensorMappings.Average_12V_Battery]) || 0 : 0
          };
          
          // Only add if we have some valid data
          const hasData = Object.values(dataPoint).some(val => 
            typeof val === 'number' && !isNaN(val) && val !== 0
          );
          
          if (hasData) {
            fileData.push(dataPoint);
            validRecords++;
          }
        }
      } catch (error) {
        addLogEntry(`Error parsing line ${i + 1}: ${error.message}`, 'error');
      }
    }
    
    addLogEntry(`Successfully parsed ${validRecords} valid records from SymphoniePRO file`, 'success');
    return fileData;
  };



  const handleFileSelect = async () => {
    try {
      addLogEntry('Opening file selection dialog...', 'info');
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = '.txt';
      
      input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        addLogEntry(`Selected ${files.length} files for processing`, 'success');
        console.log(`${t('fileUploadSuccess')}: ${files.length} files`);
      };
      
      input.click();
    } catch (error) {
      addLogEntry(`Error selecting files: ${error.message}`, 'error');
      console.error('Error selecting files:', error);
    }
  };

  const handleProcessFiles = async () => {
    if (selectedFiles.length === 0) {
      addLogEntry('No files selected for processing', 'error');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('processing');
    addLogEntry('Starting file processing...', 'info');
    
    try {
      // Only process TXT files
      const txtFiles = selectedFiles.filter(file => 
        file.name.toLowerCase().endsWith('.txt')
      );
      
      if (txtFiles.length > 0) {
        addLogEntry(`Found ${txtFiles.length} TXT files, processing directly...`, 'info');
        await handleTXTFileProcessing(txtFiles);
      } else {
        addLogEntry('No TXT files found for processing', 'error');
      }
      
      setProcessingStatus('completed');
      setIsProcessing(false);
      addLogEntry('All files processed successfully!', 'success');
    } catch (error) {
      console.error('Error processing files:', error);
      setProcessingStatus('error');
      setIsProcessing(false);
      addLogEntry(`Processing failed: ${error.message}`, 'error');
    }
  };





  const handleTXTFileProcessing = async (txtFiles) => {
    addLogEntry('Processing TXT files for visualization...', 'info');
    
    try {
      let unifiedData = [];
      
      for (let i = 0; i < txtFiles.length; i++) {
        const txtFile = txtFiles[i];
        addLogEntry(`Processing TXT file ${i + 1}/${txtFiles.length}: ${txtFile.name}`, 'info');
        
        // Get file content (either from File object or extracted content)
        let fileContent;
        if (txtFile instanceof File) {
          fileContent = await txtFile.text();
        } else {
          fileContent = txtFile.content;
        }
        
        addLogEntry(`File size: ${fileContent.length} characters`, 'info');
        
        // Parse file content
        const lines = fileContent.split('\n').filter(line => line.trim());
        addLogEntry(`Found ${lines.length} data lines in ${txtFile.name}`, 'info');
        
        // Check if this is a SymphoniePRO TXT file
        const isSymphoniePRO = txtFile.name.toLowerCase().includes('.txt') && 
          (fileContent.includes('SymphoniePRO') || fileContent.includes('NRG Systems'));
        
        if (isSymphoniePRO) {
          addLogEntry('Detected SymphoniePRO TXT format - parsing meteorological data...', 'info');
          const fileData = await parseSymphoniePROFile(fileContent, txtFile.name);
          unifiedData = [...unifiedData, ...fileData];
        } else {
          // Process as regular TXT format
          addLogEntry('Processing as regular TXT format...', 'info');
          const fileData = await parseRegularTXTFile(fileContent, txtFile.name);
          unifiedData = [...unifiedData, ...fileData];
        }
      }
      
      // Update app with unified data
      if (unifiedData.length > 0) {
        setRealTimeData(unifiedData);
        setTimeIndex(0);
        setHasData(true);
        
        // Save to library
        const libraryEntry = {
          id: Date.now().toString(),
          name: `Processed_Data_${new Date().toISOString().split('T')[0]}`,
          files: txtFiles.map(f => f.name || f),
          records: unifiedData.length,
          date: new Date().toISOString(),
          data: unifiedData,
          tags: ['TXT', 'Processed', 'Environmental'],
          summary: {
            totalRecords: unifiedData.length,
            sensorCount: 10,
            fileCount: txtFiles.length,
            lastUpdate: new Date().toLocaleTimeString()
          }
        };
        
        setLibraryFiles(prev => [libraryEntry, ...prev]);
        setSummary({
          totalRecords: unifiedData.length,
          sensorCount: 10,
          fileCount: txtFiles.length,
          lastUpdate: new Date().toLocaleTimeString()
        });
        
        addLogEntry(`Successfully processed ${txtFiles.length} TXT files with ${unifiedData.length} total records`, 'success');
      } else {
        addLogEntry('No valid data found in TXT files', 'error');
      }
      
    } catch (error) {
      addLogEntry(`TXT file processing failed: ${error.message}`, 'error');
      throw error;
    }
  };

  const parseRegularTXTFile = async (fileContent, fileName) => {
    addLogEntry(`Parsing regular TXT file: ${fileName}`, 'info');
    
    const lines = fileContent.split('\n').filter(line => line.trim());
    const fileData = [];
    let validRecords = 0;
    
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j].trim();
      if (!line || line.startsWith('#') || line.startsWith('//') || line.startsWith('Header')) continue;
      
      try {
        // Try different parsing approaches for TXT format
        let parts = [];
        
        // First try: comma-separated
        if (line.includes(',')) {
          parts = line.split(',').map(part => part.trim());
        }
        // Second try: tab-separated
        else if (line.includes('\t')) {
          parts = line.split('\t').map(part => part.trim());
        }
        // Third try: space-separated
        else if (line.includes(' ')) {
          parts = line.split(/\s+/).filter(part => part.trim());
        }
        // Fourth try: any whitespace
        else {
          parts = line.split(/\s+/).filter(part => part.trim());
        }
        
        // Filter out empty parts and try to extract numeric values
        parts = parts.filter(part => part.trim() !== '');
        
        // If we have data, try to extract values
        if (parts.length >= 3) {
          // Try to find numeric values in the parts
          const numericParts = parts.map(part => {
            const num = parseFloat(part);
            return isNaN(num) ? 0 : num;
          });
          
          // Use current time as base timestamp
          const recordTime = new Date();
          recordTime.setMinutes(recordTime.getMinutes() + j);
          
          const dataPoint = {
            time: recordTime.toLocaleTimeString(),
            timestamp: recordTime.toISOString(),
            NRG_40C_Anem: numericParts[0] || 0,
            NRG_200M_Vane: numericParts[1] || 0,
            NRG_T60_Temp: numericParts[2] || 0,
            NRG_RH5X_Humi: numericParts[3] || 0,
            NRG_BP60_Baro: numericParts[4] || 0,
            Rain_Gauge: numericParts[5] || 0,
            NRG_PVT1_PV_Temp: numericParts[6] || 0,
            PSM_c_Si_Isc_Soil: numericParts[7] || 0,
            PSM_c_Si_Isc_Clean: numericParts[8] || 0,
            Average_12V_Battery: numericParts[9] || 0
          };
          
          // Only add if we have some non-zero values
          const hasData = Object.values(dataPoint).some(val => 
            typeof val === 'number' && val !== 0 && !isNaN(val)
          );
          
          if (hasData) {
            fileData.push(dataPoint);
            validRecords++;
          }
        }
      } catch (error) {
        addLogEntry(`Error parsing line ${j + 1} in ${fileName}: ${error.message}`, 'error');
      }
    }
    
    addLogEntry(`Successfully parsed ${validRecords} valid records from ${fileName}`, 'success');
    return fileData;
  };

  const handleRLDFileProcessing = async (files) => {
    addLogEntry(t('startingRealRldFileProcessing'), 'info');
    
    try {
      let unifiedData = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        addLogEntry(`${t('processingRldFile')} ${i + 1}/${files.length}: ${file.name}`, 'info');
        
        // Read the actual file content
        const fileContent = await file.text();
        addLogEntry(`${t('fileSize')}: ${fileContent.length} ${t('characters')}`, 'info');
        
        // Parse file content
        const lines = fileContent.split('\n').filter(line => line.trim());
        addLogEntry(`${t('foundDataLines')} ${file.name}: ${lines.length}`, 'info');
        
        // Check if this is a SymphoniePRO TXT file
        const isSymphoniePRO = file.name.toLowerCase().includes('.txt') && 
          (fileContent.includes('SymphoniePRO') || fileContent.includes('NRG Systems'));
        
        if (isSymphoniePRO) {
          addLogEntry('Detected SymphoniePRO TXT format - parsing meteorological data...', 'info');
          const fileData = await parseSymphoniePROFile(fileContent, file.name);
          unifiedData = [...unifiedData, ...fileData];
        } else {
          // Original RLD parsing logic
          addLogEntry('Processing as RLD format...', 'info');
          const sampleLines = lines.slice(0, 5);
          addLogEntry(`${t('sampleLinesFrom')} ${file.name}:`, 'info');
          sampleLines.forEach((line, index) => {
            addLogEntry(`  ${t('line')} ${index + 1}: ${line.substring(0, 150)}...`, 'info');
          });
          
          const fileData = [];
          let validRecords = 0;
          
          for (let j = 0; j < lines.length; j++) {
            const line = lines[j].trim();
            if (!line || line.startsWith('#') || line.startsWith('//') || line.startsWith('Header')) continue;
            
            try {
              // Debug: Log the first few lines to understand the format
              if (j < 5) {
                addLogEntry(`${t('line')} ${j + 1}: ${line.substring(0, 100)}...`, 'info');
              }
              
              // Try different parsing approaches for RLD format
              let parts = [];
              
              // First try: comma-separated
              if (line.includes(',')) {
                parts = line.split(',').map(part => part.trim());
              }
              // Second try: tab-separated
              else if (line.includes('\t')) {
                parts = line.split('\t').map(part => part.trim());
              }
              // Third try: space-separated (but be more careful)
              else if (line.includes(' ')) {
                // Split by multiple spaces to handle fixed-width format
                parts = line.split(/\s+/).filter(part => part.trim());
              }
              // Fourth try: any whitespace
              else {
                parts = line.split(/\s+/).filter(part => part.trim());
              }
              
              // Filter out empty parts and try to extract numeric values
              parts = parts.filter(part => part.trim() !== '');
              
              addLogEntry(`${t('parsedPartsFromLine')} ${j + 1}: ${parts.length}`, 'info');
              
              // If we have data, try to extract values
              if (parts.length >= 3) {
                // Try to find numeric values in the parts
                const numericParts = parts.map(part => {
                  const num = parseFloat(part);
                  return isNaN(num) ? 0 : num;
                });
                
                // Use file creation time as base timestamp
                const fileTime = new Date(file.lastModified);
                const recordTime = new Date(fileTime.getTime() + (j * 60000));
                
                const dataPoint = {
                  time: recordTime.toLocaleTimeString(),
                  timestamp: recordTime.toISOString(),
                  NRG_40C_Anem: numericParts[0] || 0,
                  NRG_200M_Vane: numericParts[1] || 0,
                  NRG_T60_Temp: numericParts[2] || 0,
                  NRG_RH5X_Humi: numericParts[3] || 0,
                  NRG_BP60_Baro: numericParts[4] || 0,
                  Rain_Gauge: numericParts[5] || 0,
                  NRG_PVT1_PV_Temp: numericParts[6] || 0,
                  PSM_c_Si_Isc_Soil: numericParts[7] || 0,
                  PSM_c_Si_Isc_Clean: numericParts[8] || 0,
                  Average_12V_Battery: numericParts[9] || 0
                };
                
                // Only add if we have some non-zero values
                const hasData = Object.values(dataPoint).some(val => 
                  typeof val === 'number' && val !== 0 && !isNaN(val)
                );
                
                if (hasData) {
                  fileData.push(dataPoint);
                  validRecords++;
                }
              }
            } catch (error) {
              addLogEntry(`${t('errorParsingLine')} ${j + 1} ${t('in')} ${file.name}: ${error.message}`, 'error');
            }
          }
          
          addLogEntry(`${t('successfullyParsedValidRecords')} ${file.name}: ${validRecords}`, 'success');
          unifiedData = [...unifiedData, ...fileData];
        }
      }
      
      // Convert to CSV format
      addLogEntry(t('convertingUnifiedDataToCsv'), 'info');
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const csvHeaders = 'timestamp,NRG_40C_Anem,NRG_200M_Vane,NRG_T60_Temp,NRG_RH5X_Humi,NRG_BP60_Baro,Rain_Gauge,NRG_PVT1_PV_Temp,PSM_c_Si_Isc_Soil,PSM_c_Si_Isc_Clean,Average_12V_Battery\n';
      const csvContent = unifiedData.map(row => 
        `${row.timestamp},${row.NRG_40C_Anem},${row.NRG_200M_Vane},${row.NRG_T60_Temp},${row.NRG_RH5X_Humi},${row.NRG_BP60_Baro},${row.Rain_Gauge},${row.NRG_PVT1_PV_Temp},${row.PSM_c_Si_Isc_Soil},${row.PSM_c_Si_Isc_Clean},${row.Average_12V_Battery}`
      ).join('\n');
      
      const fullCSV = csvHeaders + csvContent;
      
      // Create downloadable CSV file
      const blob = new Blob([fullCSV], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
              a.download = 'unified_data.csv';
      a.click();
      URL.revokeObjectURL(url);
      
      // Automatically load and visualize the CSV data
      addLogEntry(t('automaticallyLoadingCsvData'), 'info');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Parse the CSV data and update the app
      const csvLines = fullCSV.split('\n').filter(line => line.trim());
      const headers = csvLines[0].split(',').map(h => h.trim());
      const parsedData = [];
      
      for (let i = 1; i < csvLines.length; i++) {
        const values = csvLines[i].split(',').map(v => v.trim());
        const dataPoint = {};
        
        headers.forEach((header, index) => {
          if (header === 'timestamp') {
            dataPoint.time = new Date(values[index]).toLocaleTimeString();
            dataPoint.timestamp = values[index];
          } else {
            dataPoint[header] = parseFloat(values[index]) || 0;
          }
        });
        
        parsedData.push(dataPoint);
      }
      
      // Update app with unified data
      setRealTimeData(parsedData);
      setTimeIndex(0); // Reset to beginning
      setHasData(true); // Mark that we now have data
      
      // Save to library
      const libraryEntry = {
        id: Date.now().toString(),
        name: `Unified_Data_${new Date().toISOString().split('T')[0]}`,
        files: files.map(f => f.name),
        records: parsedData.length,
        date: new Date().toISOString(),
        data: parsedData,
        tags: ['RLD', 'Unified', 'Environmental'],
        summary: {
          totalRecords: parsedData.length,
          sensorCount: 10,
          fileCount: files.length,
          lastUpdate: new Date().toLocaleTimeString()
        }
      };
      
      setLibraryFiles(prev => [libraryEntry, ...prev]);
      setSummary({
        totalRecords: parsedData.length,
        sensorCount: 10,
        fileCount: files.length,
        lastUpdate: new Date().toLocaleTimeString()
      });
      
      addLogEntry(`${t('successfullyUnifiedRldFiles')} ${files.length} ${t('files')} ${t('in')} CSV ${t('with')} ${parsedData.length} ${t('totalRecords')}`, 'success');
      addLogEntry(t('csvFileDownloadedAutomatically'), 'success');
      addLogEntry(t('dataAutomaticallyLoaded'), 'success');
      addLogEntry(t('dataSavedToLibrary'), 'success');
      
    } catch (error) {
      addLogEntry(`${t('rldUnificationFailed')}: ${error.message}`, 'error');
      console.error(t('errorProcessingRldFiles'), error);
    }
  };

  const getCurrentSensorValues = () => {
    if (realTimeData.length === 0 || !hasData) {
      return {
        NRG_40C_Anem: t('noData'),
        NRG_200M_Vane: t('noData'),
        NRG_T60_Temp: t('noData'),
        NRG_RH5X_Humi: t('noData'),
        NRG_BP60_Baro: t('noData'),
        Rain_Gauge: t('noData'),
        NRG_PVT1_PV_Temp: t('noData'),
        PSM_c_Si_Isc_Soil: t('noData'),
        PSM_c_Si_Isc_Clean: t('noData'),
        Average_12V_Battery: t('noData')
      };
    }
    return realTimeData[timeIndex] || realTimeData[realTimeData.length - 1];
  };

  // Get full dataset for charts (showing complete data with exact timestamps)
  const getCurrentChartData = () => {
    if (realTimeData.length === 0 || !hasData) {
      return [{time: t('noDataAvailable'), NRG_40C_Anem: 0, NRG_200M_Vane: 0, NRG_T60_Temp: 0, NRG_RH5X_Humi: 0, NRG_BP60_Baro: 0, Rain_Gauge: 0, NRG_PVT1_PV_Temp: 0, PSM_c_Si_Isc_Soil: 0, PSM_c_Si_Isc_Clean: 0, Average_12V_Battery: 0}];
    }
    
    // Return the complete dataset with exact timestamps
    return realTimeData;
  };

  // Get filtered data for analysis window based on time range
  const getAnalysisChartData = () => {
    if (realTimeData.length === 0 || !hasData) {
      return [{time: t('noDataAvailable'), NRG_40C_Anem: 0, NRG_200M_Vane: 0, NRG_T60_Temp: 0, NRG_RH5X_Humi: 0, NRG_BP60_Baro: 0, Rain_Gauge: 0, NRG_PVT1_PV_Temp: 0, PSM_c_Si_Isc_Soil: 0, PSM_c_Si_Isc_Clean: 0, Average_12V_Battery: 0}];
    }
    
    // Filter data based on analysis time range
    const startIndex = Math.max(0, analysisTimeRange.start);
    const endIndex = Math.min(realTimeData.length - 1, analysisTimeRange.end || realTimeData.length - 1);
    
    return realTimeData.slice(startIndex, endIndex + 1);
  };

  const currentValues = getCurrentSensorValues();
  const currentTimeData = realTimeData[timeIndex] || realTimeData[realTimeData.length - 1];

  // Create wind rose data for wind direction based on actual degrees with timestamps
  const createWindRoseData = () => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const currentData = getCurrentChartData();
    
    if (currentData.length === 0 || currentData[0].time === t('noDataAvailable') || !hasData) {
      return directions.map(direction => ({
        direction,
        value: 0,
        timestamps: []
      }));
    }
    
    // Get all wind direction readings with timestamps from the dataset
    const windData = currentData.map(point => ({
      direction: point.NRG_200M_Vane,
      timestamp: point.time,
      fullTimestamp: point.timestamp
    }));
    
    // Define direction ranges in degrees
    const directionRanges = [
      { name: 'N', min: 337.5, max: 22.5 },   // 337.5° - 22.5°
      { name: 'NE', min: 22.5, max: 67.5 },   // 22.5° - 67.5°
      { name: 'E', min: 67.5, max: 112.5 },   // 67.5° - 112.5°
      { name: 'SE', min: 112.5, max: 157.5 }, // 112.5° - 157.5°
      { name: 'S', min: 157.5, max: 202.5 },  // 157.5° - 202.5°
      { name: 'SW', min: 202.5, max: 247.5 }, // 202.5° - 247.5°
      { name: 'W', min: 247.5, max: 292.5 },  // 247.5° - 292.5°
      { name: 'NW', min: 292.5, max: 337.5 }  // 292.5° - 337.5°
    ];
    
    // Count wind directions in each range with timestamps
    const directionCounts = directionRanges.map(range => {
      const matchingData = windData.filter(windPoint => {
        // Handle the special case for North (337.5° - 22.5°)
        if (range.name === 'N') {
          return windPoint.direction >= 337.5 || windPoint.direction < 22.5;
        }
        return windPoint.direction >= range.min && windPoint.direction < range.max;
      });
      
      const timestamps = matchingData.map(point => point.timestamp);
      const count = matchingData.length;
      
      return { 
        direction: range.name, 
        value: count,
        percentage: ((count / windData.length) * 100).toFixed(1),
        timestamps: timestamps,
        totalReadings: windData.length
      };
    });
    
    return directionCounts;
  };

  // Helper function to get direction range for tooltip
  const getDirectionRange = (direction) => {
    const ranges = {
      'N': '337.5° - 22.5°',
      'NE': '22.5° - 67.5°',
      'E': '67.5° - 112.5°',
      'SE': '112.5° - 157.5°',
      'S': '157.5° - 202.5°',
      'SW': '202.5° - 247.5°',
      'W': '247.5° - 292.5°',
      'NW': '292.5° - 337.5°'
    };
    return ranges[direction] || '';
  };



  // Library functions
  const loadLibraryFile = (libraryFile) => {
    setRealTimeData(libraryFile.data);
    setSummary(libraryFile.summary);
    setHasData(true);
    setTimeIndex(0);
    setSelectedLibraryFile(libraryFile);
    addLogEntry(`${t('loadedLibraryFile')}: ${libraryFile.name}`, 'success');
  };

  const deleteLibraryFile = (fileId) => {
    setLibraryFiles(prev => prev.filter(file => file.id !== fileId));
    addLogEntry(t('libraryFileDeleted'), 'info');
  };

  // File organization functions
  const addTagToFile = (fileId, tag) => {
    setLibraryFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        const updatedTags = file.tags ? [...file.tags, tag] : [tag];
        return { ...file, tags: updatedTags };
      }
      return file;
    }));
  };

  const removeTagFromFile = (fileId, tag) => {
    setLibraryFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        const updatedTags = file.tags ? file.tags.filter(t => t !== tag) : [];
        return { ...file, tags: updatedTags };
      }
      return file;
    }));
  };

  const addNewTag = (tag) => {
    if (!availableTags.includes(tag)) {
      setAvailableTags(prev => [...prev, tag]);
    }
  };

  // Manual cleanup function for testing
  const triggerCleanup = () => {
    const savedFiles = localStorage.getItem('datasenseLibraryFiles');
    if (savedFiles) {
      const files = JSON.parse(savedFiles);
      
      // Clean old data (older than 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const cleanedFiles = files.filter(file => {
        const fileDate = new Date(file.date);
        return fileDate >= oneYearAgo;
      });
      
      if (cleanedFiles.length !== files.length) {
        localStorage.setItem('datasenseLibraryFiles', JSON.stringify(cleanedFiles));
        setLibraryFiles(cleanedFiles);
        addLogEntry(`${t('autoCleanupRemovedFiles')}: ${files.length - cleanedFiles.length}`, 'info');
      } else {
        addLogEntry(t('noOldFilesToCleanUp'), 'info');
      }
    }
  };

  // Filter files based on search and tags
  const filteredLibraryFiles = libraryFiles.filter(file => {
    const matchesSearch = searchTerm === '' || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (file.tags && file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesTags = selectedTags.length === 0 || 
      (file.tags && selectedTags.every(tag => file.tags.includes(tag)));
    
    return matchesSearch && matchesTags;
  });

  // Calculate storage statistics
  const getStorageStats = () => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const oldFiles = libraryFiles.filter(file => {
      const fileDate = new Date(file.date);
      return fileDate < oneYearAgo;
    });
    
    const totalSize = libraryFiles.reduce((sum, file) => sum + (file.records || 0), 0);
    const oldSize = oldFiles.reduce((sum, file) => sum + (file.records || 0), 0);
    
    return {
      totalFiles: libraryFiles.length,
      oldFiles: oldFiles.length,
      totalRecords: totalSize,
      oldRecords: oldSize,
      willBeCleaned: oldFiles.length > 0
    };
  };

  // Graph enlargement functions
  const handleGraphDoubleClick = (graphType) => {
    setEnlargedGraph(graphType);
    setAnalysisTimeRange({ start: 0, end: realTimeData.length - 1 });
    addLogEntry(`Enlarged ${graphType} graph for detailed analysis`, 'info');
  };

  const closeEnlargedGraph = () => {
    setEnlargedGraph(null);
    addLogEntry('Closed enlarged graph', 'info');
  };

  // Export data functionality
  const exportData = () => {
    if (realTimeData.length === 0) {
      addLogEntry('No data to export', 'error');
      return;
    }

    const dataToExport = realTimeData.map(point => ({
      timestamp: point.timestamp,
      time: point.time,
      ...point
    }));

    let exportContent = '';
    let filename = '';

    if (settings.dataExportFormat === 'csv') {
      const headers = Object.keys(dataToExport[0]).join(',');
      const rows = dataToExport.map(row => Object.values(row).join(','));
      exportContent = [headers, ...rows].join('\n');
      filename = `datasense_data_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (settings.dataExportFormat === 'json') {
      exportContent = JSON.stringify(dataToExport, null, 2);
      filename = `datasense_data_${new Date().toISOString().split('T')[0]}.json`;
    }

    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

      addLogEntry(`Data exported as ${settings.dataExportFormat.toUpperCase()}`, 'success');
};

// PDF Report Generation
const generatePDFReport = (data, timeRange, fileName) => {
  if (!data || data.length === 0) {
    addLogEntry('No data available for PDF report', 'error');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Platform color scheme
  const primaryBlue = [31, 111, 235];
  const darkBg = [13, 17, 23];
  const cardBg = [22, 27, 34];
  const textColor = [255, 255, 255];
  const secondaryText = [139, 148, 158];
  const borderColor = [48, 54, 61];

  // Get sensor units mapping
  const getSensorUnit = (sensorName) => {
    // Use custom sensor units if available, otherwise fall back to defaults
    return sensorUnits[sensorName] || 'N/A';
  };

  // Get available sensors
  const availableSensors = Object.keys(data[0] || {}).filter(key => 
    key !== 'time' && key !== 'timestamp' && data[0][key] !== undefined
  );

  // Calculate stats for each sensor
  const sensorStats = availableSensors.map(sensor => {
    const values = data.map(point => point[sensor]).filter(val => !isNaN(val));
    if (values.length === 0) return [sensor, 'N/A', 'N/A', 'N/A', getSensorUnit(sensor)];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    return [
      sensor.replace(/_/g, ' '),
      avg.toFixed(2),
      max.toFixed(2),
      min.toFixed(2),
      getSensorUnit(sensor)
    ];
  });

  // Use all sensors in one table
  const allSensors = sensorStats;

  // PAGE 1
  // Dark background
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header
  doc.setFillColor(...primaryBlue);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(20);
  doc.setTextColor(...textColor);
        doc.text(t('nrgDataSense'), pageWidth / 2, 25, { align: 'center' });

  // Report Info
  doc.setFillColor(...cardBg);
  doc.rect(margin, 50, pageWidth - 2 * margin, 30, 'F');
  doc.setDrawColor(...borderColor);
  doc.rect(margin, 50, pageWidth - 2 * margin, 30, 'S');
  
  doc.setFontSize(12);
  doc.setTextColor(...textColor);
        doc.text(`${t('generated')}: ${new Date().toLocaleString()}`, margin + 5, 65);
      doc.text(`${t('file')}: ${fileName} | ${t('records')}: ${data.length}`, margin + 5, 75);

  // Data Summary Table - First Half
  doc.setFontSize(16);
  doc.setTextColor(...primaryBlue);
  doc.text(t('sensorDataAnalysis'), margin, 100);

  autoTable(doc, {
    startY: 110,
    head: [[t('sensor'), t('average'), t('max'), t('lowest'), t('unit')]],
    body: allSensors,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryBlue,
      textColor: textColor,
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: textColor,
      fillColor: cardBg
    },
    alternateRowStyles: {
      fillColor: [26, 32, 39]
    },
    styles: { 
      fontSize: 9,
      cellPadding: 4
    }
  });

  // Footer Page 1
  doc.setFillColor(...cardBg);
  doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
  doc.setDrawColor(...borderColor);
  doc.rect(0, pageHeight - 25, pageWidth, 25, 'S');
  
  doc.setFontSize(10);
  doc.setTextColor(...secondaryText);
  doc.text(`${t('nrgDataSense')} - ${t('environmentalDataAnalysis')}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Save PDF
      const pdfFileName = `DataSense_Report_${fileName}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(pdfFileName);
  
        addLogEntry(`${t('pdfReportGenerated')}: ${pdfFileName}`, 'success');
};

  return (
    <AppContainer>
      <Header>
        <HeaderLeft>
          {/* PNG Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginLeft: '-20px',
            padding: '12px',
            minHeight: '70px'
          }}>
            <img 
              src="/assets/datasense-logo.png" 
              alt="DataSense Logo"
              style={{
                width: 'auto',
                height: 'auto',
                maxHeight: '60px',
                minHeight: '50px'
              }}
              onError={(e) => {
                // Fallback to text if image fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span style={{ 
              display: 'none', 
              color: '#ffffff', 
              fontSize: '14px', 
              fontWeight: '600' 
            }}>
              DataSense
            </span>
          </div>
        </HeaderLeft>
        <HeaderRight>
          
          <NavButton>
            <StatusIndicator status={backendStatus}>
              <StatusDot status={backendStatus} />
              {backendStatus === 'connected' ? 'Connected' : 
               backendStatus === 'connecting' ? 'Connecting...' : 
               'Not Deployed'}
            </StatusIndicator>
          </NavButton>
          <NavButton 
            active={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
          >
            <FiBarChart2 />
            {t('dashboard')}
          </NavButton>
          <NavButton 
            active={currentView === 'library'}
            onClick={() => setCurrentView('library')}
          >
            <FiFolder />
            {t('library')}
          </NavButton>
          <NavButton 
            onClick={() => setShowSettings(true)}
          >
            <FiSettings />
            {t('settings')}
          </NavButton>
          <LanguageToggle onClick={() => setLanguage(language === 'en' ? 'es-DO' : 'en')}>
            <FiGlobe />
            {language === 'en' ? 'EN' : 'ES'}
          </LanguageToggle>
        </HeaderRight>
      </Header>

      <MainContent>
        <ContentArea>
          {currentView === 'dashboard' && (
            <DashboardView>
              <DashboardHeader>
                <div>
                  <DashboardTitle>
                    <FiBarChart2 />
                    {t('sensorDataDashboard')}
                  </DashboardTitle>
                                      <DashboardSubtitle>Visualization of sensor data from the last 24 hours</DashboardSubtitle>
                </div>
                
                <InteractiveControls>
                  <ControlButton 
                    onClick={() => {
                      if (realTimeData.length > 0) {
                        const timeRange = {
                          start: realTimeData[0]?.time || 'Start',
                          end: realTimeData[realTimeData.length - 1]?.time || 'End'
                        };
                        generatePDFReport(realTimeData, timeRange, 'Current_Data');
                      }
                    }}
                    title={t('generatePdfReport')}
                    disabled={!hasData}
                  >
                    <FiDownload />
                    {t('pdfReport')}
                  </ControlButton>
                    

                </InteractiveControls>
              </DashboardHeader>

              <SummaryCards>
                <SummaryCard>
                  <SummaryIcon>
                    <FiDatabase />
                  </SummaryIcon>
                  <SummaryContent>
                                            <SummaryValue>{hasData ? summary.totalRecords : t('noData')}</SummaryValue>
                    <SummaryLabel>{t('totalRecords')}</SummaryLabel>
                  </SummaryContent>
                </SummaryCard>

                <SummaryCard>
                  <SummaryIcon>
                    <FiActivity />
                  </SummaryIcon>
                  <SummaryContent>
                                            <SummaryValue>{hasData ? summary.sensorCount : t('noData')}</SummaryValue>
                    <SummaryLabel>{t('sensorCount')}</SummaryLabel>
                  </SummaryContent>
                </SummaryCard>

                <SummaryCard>
                  <SummaryIcon>
                    <FiFile />
                  </SummaryIcon>
                  <SummaryContent>
                                            <SummaryValue>{hasData ? summary.fileCount : t('noData')}</SummaryValue>
                    <SummaryLabel>{t('fileCount')}</SummaryLabel>
                  </SummaryContent>
                </SummaryCard>

                <SummaryCard>
                  <SummaryIcon>
                    <FiClock />
                  </SummaryIcon>
                  <SummaryContent>
                                            <SummaryValue>{hasData ? summary.lastUpdate : t('noData')}</SummaryValue>
                    <SummaryLabel>{t('lastUpdate')}</SummaryLabel>
                  </SummaryContent>
                </SummaryCard>
              </SummaryCards>

              <GraphsContainer>
                {/* Wind Direction - Wind Rose */}
                                <GraphCard onDoubleClick={() => handleGraphDoubleClick('windRose')} style={{ cursor: 'pointer' }}>
                  <GraphTitle>
                    <FiWind />
                    {t('windRose')}
                  </GraphTitle>
                  <ScrollableChartContainer>
                    <ChartWrapper dataLength={realTimeData.length}>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={createWindRoseData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                          <XAxis dataKey="direction" stroke="#8b949e" />
                          <YAxis stroke="#8b949e" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
                            formatter={(value, name, props) => [
                              `${value} ${t('readings')} (${props.payload.percentage}%)`,
                              t('windDirection')
                            ]}
                            labelFormatter={(label) => `${label} (${getDirectionRange(label)})`}
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div style={{ 
                                    backgroundColor: '#161b22', 
                                    border: '1px solid #30363d',
                                    padding: '10px',
                                    borderRadius: '4px'
                                  }}>
                                    <p style={{ color: '#fff', margin: '0 0 5px 0' }}>
                                      <strong>{label} ({getDirectionRange(label)})</strong>
                                    </p>
                                    <p style={{ color: '#8b949e', margin: '0 0 5px 0' }}>
                                      {data.value} {t('readings')} ({data.percentage}%)
                                    </p>
                                    <p style={{ color: '#8b949e', margin: '0 0 5px 0', fontSize: '12px' }}>
                                      Total readings: {data.totalReadings}
                                    </p>
                                    {data.timestamps.length > 0 && (
                                      <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                        <p style={{ color: '#8b949e', margin: '0 0 3px 0', fontSize: '11px' }}>
                                          <strong>Sample timestamps:</strong>
                                        </p>
                                        {data.timestamps.slice(0, 5).map((time, index) => (
                                          <p key={index} style={{ color: '#8b949e', margin: '0', fontSize: '10px' }}>
                                            {time}
                                          </p>
                                        ))}
                                        {data.timestamps.length > 5 && (
                                          <p style={{ color: '#8b949e', margin: '0', fontSize: '10px' }}>
                                            ... and {data.timestamps.length - 5} more
                                          </p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="value" fill="#1f6feb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  </ScrollableChartContainer>
                </GraphCard>

                {/* Temperature Trend */}
                <GraphCard onDoubleClick={() => handleGraphDoubleClick('temperature')} style={{ cursor: 'pointer' }}>
                  <GraphTitle>
                    <FiThermometer />
                    {t('temperatureTrend')}
                  </GraphTitle>
                  <ScrollableChartContainer>
                    <ChartWrapper dataLength={realTimeData.length}>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getCurrentChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                          <XAxis dataKey="time" stroke="#8b949e" />
                          <YAxis stroke="#8b949e" />
                          <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                          <Legend />
                          <Line type="monotone" dataKey="NRG_T60_Temp" stroke="#e74c3c" strokeWidth={2} />
                          <Line type="monotone" dataKey="NRG_PVT1_PV_Temp" stroke="#f39c12" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  </ScrollableChartContainer>
                </GraphCard>

                {/* Humidity Chart */}
                <GraphCard onDoubleClick={() => handleGraphDoubleClick('humidity')} style={{ cursor: 'pointer' }}>
                  <GraphTitle>
                    <FiDroplet />
                    {t('humidityChart')}
                  </GraphTitle>
                  <ScrollableChartContainer>
                    <ChartWrapper dataLength={realTimeData.length}>
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={getCurrentChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                          <XAxis dataKey="time" stroke="#8b949e" />
                          <YAxis stroke="#8b949e" />
                          <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                          <Area type="monotone" dataKey="NRG_RH5X_Humi" stroke="#3498db" fill="#3498db" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  </ScrollableChartContainer>
                </GraphCard>

                {/* Pressure Chart */}
                <GraphCard onDoubleClick={() => handleGraphDoubleClick('pressure')} style={{ cursor: 'pointer' }}>
                  <GraphTitle>
                    <FiTrendingUp />
                    {t('pressureChart')}
                  </GraphTitle>
                  <ScrollableChartContainer>
                    <ChartWrapper dataLength={realTimeData.length}>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getCurrentChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                          <XAxis dataKey="time" stroke="#8b949e" />
                          <YAxis stroke="#8b949e" />
                          <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                          <Line type="monotone" dataKey="NRG_BP60_Baro" stroke="#9b59b6" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  </ScrollableChartContainer>
                </GraphCard>

                {/* Rainfall Chart */}
                <GraphCard onDoubleClick={() => handleGraphDoubleClick('rainfall')} style={{ cursor: 'pointer' }}>
                  <GraphTitle>
                    <FiDroplet />
                    {t('rainfallChart')}
                  </GraphTitle>
                  <ScrollableChartContainer>
                    <ChartWrapper dataLength={realTimeData.length}>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={getCurrentChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                          <XAxis dataKey="time" stroke="#8b949e" />
                          <YAxis stroke="#8b949e" />
                          <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                          <Bar dataKey="Rain_Gauge" fill="#3498db" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  </ScrollableChartContainer>
                </GraphCard>

                {/* Solar Chart */}
                <GraphCard onDoubleClick={() => handleGraphDoubleClick('solar')} style={{ cursor: 'pointer' }}>
                  <GraphTitle>
                    <FiSun />
                    {t('solarChart')}
                  </GraphTitle>
                  <ScrollableChartContainer>
                    <ChartWrapper dataLength={realTimeData.length}>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getCurrentChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                          <XAxis dataKey="time" stroke="#8b949e" />
                          <YAxis stroke="#8b949e" />
                          <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                          <Legend />
                          <Line type="monotone" dataKey="PSM_c_Si_Isc_Soil" stroke="#e67e22" strokeWidth={2} />
                          <Line type="monotone" dataKey="PSM_c_Si_Isc_Clean" stroke="#f1c40f" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  </ScrollableChartContainer>
                </GraphCard>

                {/* Battery Chart */}
                <GraphCard onDoubleClick={() => handleGraphDoubleClick('battery')} style={{ cursor: 'pointer' }}>
                  <GraphTitle>
                    <FiBattery />
                    {t('batteryChart')}
                  </GraphTitle>
                  <ScrollableChartContainer>
                    <ChartWrapper dataLength={realTimeData.length}>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getCurrentChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                          <XAxis dataKey="time" stroke="#8b949e" />
                          <YAxis stroke="#8b949e" />
                          <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                          <Line type="monotone" dataKey="Average_12V_Battery" stroke="#27ae60" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  </ScrollableChartContainer>
                </GraphCard>



                {/* Wind Speed */}
                <GraphCard onDoubleClick={() => handleGraphDoubleClick('windSpeed')} style={{ cursor: 'pointer' }}>
                  <GraphTitle>
                    <FiWind />
                    {t('windSpeed')}
                  </GraphTitle>
                  <ScrollableChartContainer>
                    <ChartWrapper dataLength={realTimeData.length}>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={getCurrentChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                          <XAxis dataKey="time" stroke="#8b949e" />
                          <YAxis stroke="#8b949e" />
                          <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                          <Line type="monotone" dataKey="NRG_40C_Anem" stroke="#1f6feb" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartWrapper>
                  </ScrollableChartContainer>
                </GraphCard>


              </GraphsContainer>




            </DashboardView>
          )}

          {currentView === 'library' && (
            <DashboardView>
              <DashboardHeader>
                <div>
                  <DashboardTitle>
                    <FiFolder />
                    {t('historicalDataLibrary')}
                  </DashboardTitle>
                  <DashboardSubtitle>Browse and search historical RLD data files</DashboardSubtitle>
                </div>
                
                <InteractiveControls>
                  <ControlButton 
                    onClick={triggerCleanup}
                    title="Clean up old files"
                  >
                    <FiTrash2 />
                    Cleanup
                  </ControlButton>
                </InteractiveControls>
              </DashboardHeader>

              {/* Search and Filter Section */}
              <SearchFilterSection>
                <SearchBox>
                  <FiSearch />
                  <input
                    type="text"
                    placeholder={t('searchFiles')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchBox>
                
                <FilterSection>
                  <TagFilter>
                    <label>Filter by tags:</label>
                    <TagButtons>
                      {availableTags.map(tag => (
                        <TagButton
                          key={tag}
                          active={selectedTags.includes(tag)}
                          onClick={() => {
                            if (selectedTags.includes(tag)) {
                              setSelectedTags(selectedTags.filter(t => t !== tag));
                            } else {
                              setSelectedTags([...selectedTags, tag]);
                            }
                          }}
                        >
                          {tag}
                        </TagButton>
                      ))}
                    </TagButtons>
                  </TagFilter>
                </FilterSection>
              </SearchFilterSection>

              {/* Library Statistics */}
              <LibraryStats>
                <LibraryStatCard>
                  <LibraryStatValue>{getStorageStats().totalFiles}</LibraryStatValue>
                  <LibraryStatLabel>Total Files</LibraryStatLabel>
                </LibraryStatCard>
                <LibraryStatCard>
                  <LibraryStatValue>{getStorageStats().totalRecords.toLocaleString()}</LibraryStatValue>
                  <LibraryStatLabel>Total Records</LibraryStatLabel>
                </LibraryStatCard>
                <LibraryStatCard>
                  <LibraryStatValue>{filteredLibraryFiles.length}</LibraryStatValue>
                  <LibraryStatLabel>Filtered Results</LibraryStatLabel>
                </LibraryStatCard>
                <LibraryStatCard>
                  <LibraryStatValue>{getStorageStats().oldFiles}</LibraryStatValue>
                  <LibraryStatLabel>Old Files (1+ year)</LibraryStatLabel>
                </LibraryStatCard>
              </LibraryStats>

              {/* Library Files Grid */}
              <LibraryGrid>
                {filteredLibraryFiles.length === 0 ? (
                  <EmptyState>
                    <FiFolder />
                    <h3>No files found</h3>
                    <p>Upload and process RLD files to see them here</p>
                  </EmptyState>
                ) : (
                  filteredLibraryFiles.map((file) => (
                    <LibraryCard key={file.id}>
                      <LibraryCardHeader>
                        <FileIcon>
                          <FiFile />
                        </FileIcon>
                        <FileInfo>
                          <FileName>{file.name}</FileName>
                                                   <FileMeta>
                           <span>{file.records} records</span>
                           <span>•</span>
                           <span>{file.processingDate || new Date(file.date).toLocaleDateString()}</span>
                           <span>•</span>
                           <span>{file.source === 'backend' ? 'Server' : 'Local'}</span>
                         </FileMeta>
                        </FileInfo>
                        <FileActions>
                          <ActionButton
                            onClick={() => loadLibraryFile(file)}
                            title="Load this file"
                          >
                            <FiPlay />
                          </ActionButton>
                          <ActionButton
                            onClick={() => deleteLibraryFile(file.id)}
                            title="Delete this file"
                            danger
                          >
                            <FiTrash2 />
                          </ActionButton>
                        </FileActions>
                      </LibraryCardHeader>
                      
                      {file.tags && file.tags.length > 0 && (
                        <FileTags>
                          {file.tags.map(tag => (
                            <Tag key={tag}>
                              {tag}
                              <RemoveTag onClick={() => removeTagFromFile(file.id, tag)}>
                                <FiX />
                              </RemoveTag>
                            </Tag>
                          ))}
                        </FileTags>
                      )}
                      
                      <AddTagSection>
                        <input
                          type="text"
                          placeholder="Add tag..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              addTagToFile(file.id, e.target.value.trim());
                              addNewTag(e.target.value.trim());
                              e.target.value = '';
                            }
                          }}
                        />
                      </AddTagSection>
                    </LibraryCard>
                  ))
                )}
              </LibraryGrid>
            </DashboardView>
          )}

        </ContentArea>
      </MainContent>

          {currentView === 'documentation' && (
            <DashboardView>
              <DashboardHeader>
                <div>
                  <DashboardTitle>
                    <FiFile />
                    {t('documentation')}
                  </DashboardTitle>
                  <DashboardSubtitle>Complete guide to NRG DataSense</DashboardSubtitle>
                </div>
              </DashboardHeader>

              <GraphsContainer>
                <GraphCard>
                  <GraphTitle>
                    <FiGlobe />
                    {language === 'en' ? 'English Documentation' : 'Documentación en Español'}
                  </GraphTitle>
                  <div style={{ padding: '20px', color: '#fff', lineHeight: '1.6' }}>
                    {language === 'en' ? (
                      <div>
                        <h3 style={{ color: '#1f6feb', marginBottom: '15px' }}>NRG DataSense - Complete User Guide</h3>
                        
                        <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>Overview</h4>
                        <p>NRG DataSense is a comprehensive environmental data visualization and analysis tool designed specifically for processing Symphonie Pro data logger RLD files. The application provides real-time data processing, interactive visualizations, and historical data management.</p>
                        
                        <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>Key Features</h4>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li><strong>File Processing:</strong> Upload and process multiple RLD files (1-10 files) simultaneously</li>
                          <li><strong>Data Visualization:</strong> Interactive charts for wind speed, temperature, humidity, pressure, rainfall, solar current, and battery voltage</li>
                          <li><strong>Wind Rose Analysis:</strong> Specialized wind direction visualization with degree-based analysis</li>
                          <li><strong>Real-time Monitoring:</strong> Live data updates with configurable refresh intervals</li>
                          <li><strong>Historical Library:</strong> Store and retrieve processed data files</li>
                          <li><strong>Full-screen Analysis:</strong> Detailed data analysis with time range selection</li>
                          <li><strong>Multi-language Support:</strong> English and Spanish (Dominican Republic) localization</li>
                          <li><strong>Customizable Settings:</strong> Theme, units, export formats, and chart types</li>
                        </ul>
                        
                        <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>Technical Architecture</h4>
                        <p><strong>Frontend:</strong> React.js with Styled Components for modern, responsive UI</p>
                        <p><strong>Charts:</strong> Recharts library for interactive data visualization</p>
                        <p><strong>Animations:</strong> Framer Motion for smooth, professional animations</p>
                        <p><strong>File Processing:</strong> Browser-based RLD file parsing and CSV conversion</p>
                        <p><strong>Data Management:</strong> In-memory data storage with localStorage persistence</p>
                        
                        <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>How to Use</h4>
                        <ol style={{ paddingLeft: '20px' }}>
                          <li><strong>Upload Files:</strong> Click "Upload Files" to select 1-10 RLD files from your Symphonie Pro data logger</li>
                          <li><strong>Process Data:</strong> Click "Process Files" to convert RLD files to CSV and visualize the data</li>
                          <li><strong>View Dashboard:</strong> Monitor real-time sensor data and interactive charts</li>
                          <li><strong>Analyze Data:</strong> Double-click any chart for full-screen detailed analysis</li>
                          <li><strong>Manage Library:</strong> Access the Library panel to view and reload historical data</li>
                          <li><strong>Configure Settings:</strong> Customize theme, units, and processing options in Settings</li>
                        </ol>
                        
                        <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>Sensor Types</h4>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li><strong>Wind Speed (NRG_40C_Anem):</strong> Anemometer readings in m/s</li>
                          <li><strong>Wind Direction (NRG_200M_Vane):</strong> Wind vane readings in degrees</li>
                          <li><strong>Temperature (NRG_T60_Temp):</strong> Temperature sensor in °C</li>
                          <li><strong>Humidity (NRG_RH5X_Humi):</strong> Relative humidity in %</li>
                          <li><strong>Pressure (NRG_BP60_Baro):</strong> Barometric pressure in hPa</li>
                          <li><strong>Rainfall (Rain_Gauge):</strong> Rainfall accumulation in mm</li>
                          <li><strong>Solar Current (PSM_c_Si_Isc_*):</strong> Solar panel current in mA</li>
                          <li><strong>Battery Voltage (Average_12V_Battery):</strong> Battery voltage in V</li>
                        </ul>
                      </div>
                    ) : (
                      <div>
                        <h3 style={{ color: '#1f6feb', marginBottom: '15px' }}>NRG DataSense - Guía Completa del Usuario</h3>
                        
                        <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>Descripción General</h4>
                        <p>NRG DataSense es una herramienta integral de visualización y análisis de datos ambientales diseñada específicamente para procesar archivos RLD del registrador de datos Symphonie Pro. La aplicación proporciona procesamiento de datos en tiempo real, visualizaciones interactivas y gestión de datos históricos.</p>
                        
                        <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>Características Principales</h4>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li><strong>Procesamiento de Archivos:</strong> Subir y procesar múltiples archivos RLD (1-10 archivos) simultáneamente</li>
                          <li><strong>Visualización de Datos:</strong> Gráficos interactivos para velocidad del viento, temperatura, humedad, presión, lluvia, corriente solar y voltaje de batería</li>
                          <li><strong>Análisis de Rosa de Vientos:</strong> Visualización especializada de dirección del viento con análisis basado en grados</li>
                          <li><strong>Monitoreo en Tiempo Real:</strong> Actualizaciones de datos en vivo con intervalos de actualización configurables</li>
                          <li><strong>Biblioteca Histórica:</strong> Almacenar y recuperar archivos de datos procesados</li>
                          <li><strong>Análisis de Pantalla Completa:</strong> Análisis detallado de datos con selección de rango de tiempo</li>
                          <li><strong>Soporte Multi-idioma:</strong> Localización en inglés y español (República Dominicana)</li>
                          <li><strong>Configuración Personalizable:</strong> Tema, unidades, formatos de exportación y tipos de gráficos</li>
                        </ul>
                        
                        <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>Arquitectura Técnica</h4>
                        <p><strong>Frontend:</strong> React.js con Styled Components para interfaz moderna y responsiva</p>
                        <p><strong>Gráficos:</strong> Biblioteca Recharts para visualización interactiva de datos</p>
                        <p><strong>Animaciones:</strong> Framer Motion para animaciones suaves y profesionales</p>
                        <p><strong>Procesamiento de Archivos:</strong> Análisis de archivos RLD basado en navegador y conversión a CSV</p>
                        <p><strong>Gestión de Datos:</strong> Almacenamiento de datos en memoria con persistencia localStorage</p>
                        
                        <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>Cómo Usar</h4>
                        <ol style={{ paddingLeft: '20px' }}>
                          <li><strong>Subir Archivos:</strong> Hacer clic en "Subir Archivos" para seleccionar 1-10 archivos RLD de su registrador de datos Symphonie Pro</li>
                          <li><strong>Procesar Datos:</strong> Hacer clic en "Procesar Archivos" para convertir archivos RLD a CSV y visualizar los datos</li>
                          <li><strong>Ver Panel Principal:</strong> Monitorear datos de sensores en tiempo real y gráficos interactivos</li>
                          <li><strong>Analizar Datos:</strong> Hacer doble clic en cualquier gráfico para análisis detallado de pantalla completa</li>
                          <li><strong>Gestionar Biblioteca:</strong> Acceder al panel Biblioteca para ver y recargar datos históricos</li>
                          <li><strong>Configurar Ajustes:</strong> Personalizar tema, unidades y opciones de procesamiento en Configuración</li>
                        </ol>
                        
                        <h4 style={{ color: '#fff', marginTop: '20px', marginBottom: '10px' }}>Tipos de Sensores</h4>
                        <ul style={{ paddingLeft: '20px' }}>
                          <li><strong>Velocidad del Viento (NRG_40C_Anem):</strong> Lecturas del anemómetro en m/s</li>
                          <li><strong>Dirección del Viento (NRG_200M_Vane):</strong> Lecturas de la veleta en grados</li>
                          <li><strong>Temperatura (NRG_T60_Temp):</strong> Sensor de temperatura en °C</li>
                          <li><strong>Humedad (NRG_RH5X_Humi):</strong> Humedad relativa en %</li>
                          <li><strong>Presión (NRG_BP60_Baro):</strong> Presión barométrica en hPa</li>
                          <li><strong>Lluvia (Rain_Gauge):</strong> Acumulación de lluvia en mm</li>
                          <li><strong>Corriente Solar (PSM_c_Si_Isc_*):</strong> Corriente del panel solar en mA</li>
                          <li><strong>Voltaje de Batería (Average_12V_Battery):</strong> Voltaje de batería en V</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </GraphCard>
              </GraphsContainer>
            </DashboardView>
          )}

      {/* Enlarged Graph Modal */}
      {enlargedGraph && (
        <EnlargedGraphModal>
          <EnlargedGraphContent>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '20px', 
              borderBottom: '1px solid #30363d',
              background: '#161b22'
            }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '24px' }}>
                {enlargedGraph === 'windRose' && `${t('windRose')} - ${t('fullScreenAnalysis')}`}
                {enlargedGraph === 'windSpeed' && `${t('windSpeed')} - ${t('fullScreenAnalysis')}`}
                {enlargedGraph === 'temperature' && `${t('temperatureTrend')} - ${t('fullScreenAnalysis')}`}
                {enlargedGraph === 'humidity' && `${t('humidityChart')} - ${t('fullScreenAnalysis')}`}
                {enlargedGraph === 'pressure' && `${t('pressureChart')} - ${t('fullScreenAnalysis')}`}
                {enlargedGraph === 'rainfall' && `${t('rainfallChart')} - ${t('fullScreenAnalysis')}`}
                {enlargedGraph === 'solar' && `${t('solarChart')} - ${t('fullScreenAnalysis')}`}
                {enlargedGraph === 'battery' && `${t('batteryChart')} - ${t('fullScreenAnalysis')}`}
              </h2>
              <CloseButton onClick={closeEnlargedGraph} style={{ fontSize: '16px', padding: '10px 20px' }}>
                {t('closeAnalysisWindow')}
              </CloseButton>
            </div>

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <GraphStats style={{ marginBottom: '20px' }}>
                <StatCard>
                  <StatValue>{realTimeData.length.toLocaleString()}</StatValue>
                  <StatLabel>Total Data Points</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{realTimeData.length > 0 ? new Date(realTimeData[0].timestamp).toLocaleDateString() : 'N/A'}</StatValue>
                  <StatLabel>Start Date</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{realTimeData.length > 0 ? new Date(realTimeData[realTimeData.length - 1].timestamp).toLocaleDateString() : 'N/A'}</StatValue>
                  <StatLabel>End Date</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{realTimeData.length > 0 ? `${Math.round((new Date(realTimeData[realTimeData.length - 1].timestamp) - new Date(realTimeData[0].timestamp)) / (1000 * 60 * 60))}h` : 'N/A'}</StatValue>
                  <StatLabel>Duration</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{realTimeData.length > 0 ? `${Math.round((new Date(realTimeData[realTimeData.length - 1].timestamp) - new Date(realTimeData[0].timestamp)) / (1000 * 60))} min` : 'N/A'}</StatValue>
                  <StatLabel>Total Minutes</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{realTimeData.length > 0 ? `${(realTimeData.length / 60).toFixed(1)}` : 'N/A'}</StatValue>
                  <StatLabel>Readings/Hour</StatLabel>
                </StatCard>
              </GraphStats>

              <div style={{ 
                flex: 1, 
                width: '100%', 
                background: '#161b22', 
                borderRadius: '8px',
                padding: '20px',
                border: '1px solid #30363d'
              }}>
              {enlargedGraph === 'windRose' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={createWindRoseData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="direction" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
                      formatter={(value, name, props) => [
                        `${value} ${t('readings')} (${props.payload.percentage}%)`,
                        t('windDirection')
                      ]}
                      labelFormatter={(label) => `${label} (${getDirectionRange(label)})`}
                    />
                    <Bar dataKey="value" fill="#1f6feb" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {enlargedGraph === 'windSpeed' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getAnalysisChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="time" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                    <Line type="monotone" dataKey="NRG_40C_Anem" stroke="#1f6feb" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {enlargedGraph === 'temperature' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getAnalysisChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="time" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                    <Legend />
                    <Line type="monotone" dataKey="NRG_T60_Temp" stroke="#e74c3c" strokeWidth={3} />
                    <Line type="monotone" dataKey="NRG_PVT1_PV_Temp" stroke="#f39c12" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {enlargedGraph === 'humidity' && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getAnalysisChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="time" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                    <Area type="monotone" dataKey="NRG_RH5X_Humi" stroke="#3498db" fill="#3498db" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {enlargedGraph === 'pressure' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getAnalysisChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="time" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                    <Line type="monotone" dataKey="NRG_BP60_Baro" stroke="#9b59b6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {enlargedGraph === 'rainfall' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getAnalysisChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="time" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                    <Bar dataKey="Rain_Gauge" fill="#3498db" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {enlargedGraph === 'solar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getAnalysisChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="time" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                    <Legend />
                    <Line type="monotone" dataKey="PSM_c_Si_Isc_Soil" stroke="#e67e22" strokeWidth={3} />
                    <Line type="monotone" dataKey="PSM_c_Si_Isc_Clean" stroke="#f1c40f" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {enlargedGraph === 'battery' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getAnalysisChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="time" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                    <Line type="monotone" dataKey="Average_12V_Battery" stroke="#27ae60" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              </div>
            </div>
          </EnlargedGraphContent>
        </EnlargedGraphModal>
      )}





      {/* Settings Panel */}
      {showSettings && (
        <>
          <Overlay onClick={() => setShowSettings(false)} />
          <SettingsPanel
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <SettingsHeader>
              <SettingsTitle>
                <FiSettings />
                {t('settings')}
              </SettingsTitle>
              <SettingsCloseButton onClick={() => setShowSettings(false)}>
                ×
              </SettingsCloseButton>
            </SettingsHeader>



            <SettingsSection>
              <SettingsSectionTitle>
                <FiThermometer />
                {t('sensorUnits')}
              </SettingsSectionTitle>
              
              {Object.keys(sensorUnits).map(sensorName => (
                <SensorUnitCard key={sensorName}>
                  <SensorUnitName>
                    {getSensorDisplayName(sensorName)}
                  </SensorUnitName>
                  <UnitSelect
                    value={sensorUnits[sensorName]}
                    onChange={(e) => handleUnitChange(sensorName, e.target.value)}
                  >
                    {sensorUnitOptions[sensorName]?.map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    )) || (
                      <option value={sensorUnits[sensorName]}>
                        {sensorUnits[sensorName]}
                      </option>
                    )}
                  </UnitSelect>
                </SensorUnitCard>
              ))}
            </SettingsSection>

            {settingsSaveStatus.message && (
              <SettingsStatus type={settingsSaveStatus.type}>
                {settingsSaveStatus.message}
              </SettingsStatus>
            )}
            
            <ButtonGroup>
              <SettingsButton onClick={saveSettings}>
                <FiDownload />
                {t('save')}
              </SettingsButton>
              <SettingsButton variant="secondary" onClick={resetToDefaults}>
                <FiRotateCcw />
                {t('reset')}
              </SettingsButton>
              <SettingsButton variant="secondary" onClick={() => setShowSettings(false)}>
                {t('cancel')}
              </SettingsButton>
            </ButtonGroup>
          </SettingsPanel>
        </>
      )}
    </AppContainer>
  );
};

export default App; 