import React, {createContext, useContext, useEffect, useState} from 'react';

// Presentation preferences only. No seeded records, business mutations or demo identity.
const Context = createContext<ReturnType<typeof usePresentation> | null>(null);
function usePresentation() {
 const [adminActiveTab, setTab] = useState(()=>window.location.hash.slice(1)||'orders');
 const [themeMode,setThemeMode] = useState<'light'|'dark'>(()=>localStorage.getItem('bettatraka_theme')==='light'?'light':'dark');
 const [isMobileSidebarOpen,setIsMobileSidebarOpen] = useState(false);
 const [isSidebarCollapsed,setIsSidebarCollapsed] = useState(false);
 useEffect(()=>{document.documentElement.classList.toggle('light',themeMode==='light');document.documentElement.classList.toggle('dark',themeMode==='dark');localStorage.setItem('bettatraka_theme',themeMode)},[themeMode]);
 useEffect(()=>{const onHash=()=>{setTab(window.location.hash.slice(1)||'orders');setIsMobileSidebarOpen(false)};window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash)},[]);
 const setAdminActiveTab=(tab:string)=>{setTab(tab);window.location.hash=tab;setIsMobileSidebarOpen(false)};
 return {adminActiveTab,setAdminActiveTab,themeMode,setThemeMode,isMobileSidebarOpen,setIsMobileSidebarOpen,isSidebarCollapsed,toggleSidebarCollapse:()=>setIsSidebarCollapsed(v=>!v),toggleMobileSidebar:()=>setIsMobileSidebarOpen(v=>!v),toggleThemeMode:()=>setThemeMode(v=>v==='light'?'dark':'light')};
}
export function WorkspaceUIProvider({children}:{children:React.ReactNode}) {const value=usePresentation();return <Context.Provider value={value}>{children}</Context.Provider>}
export function useWorkspaceUI(){const value=useContext(Context);if(!value)throw new Error('WorkspaceUIProvider required');return value}
