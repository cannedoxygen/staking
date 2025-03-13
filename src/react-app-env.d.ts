/// <reference types="react-scripts" />

/**
 * Extensions to the Window interface for wallet providers
 */
interface Window {
    // Sui Wallet
    suiWallet?: {
      requestPermissions: () => Promise<void>;
      getAccounts: () => Promise<string[]>;
      getNetwork: () => Promise<{ chain: string }>;
      signAndExecuteTransactionBlock: (params: any) => Promise<any>;
    };
    
    // Ethos Wallet
    ethosWallet?: {
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      getAccounts: () => Promise<{ accounts: string[] }>;
      getChain: () => Promise<{ chain: string }>;
      signAndExecuteTransactionBlock: (params: any) => Promise<any>;
    };
    
    // Suiet Wallet
    suiet?: {
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      getAccounts: () => Promise<string[]>;
      getNetwork: () => Promise<{ chain: string }>;
      signAndExecuteTransactionBlock: (params: any) => Promise<any>;
    };
    
    // Martian Wallet
    martian?: {
      connect: () => Promise<void>;
      disconnect: () => Promise<void>;
      getAccounts: () => Promise<string[]>;
      getNetwork: () => Promise<{ chain: string }>;
      signAndExecuteTransactionBlock: (params: any) => Promise<any>;
    };
    
    // File system access for compatibility with artifacts
    fs?: {
      readFile: (path: string, options?: { encoding?: string }) => Promise<any>;
    };
  }
  
  /**
   * Declaration for SVG imports
   */
  declare module "*.svg" {
    import React = require('react');
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
  }
  
  /**
   * Declaration for PNG imports
   */
  declare module "*.png" {
    const content: string;
    export default content;
  }
  
  /**
   * Declaration for JPG imports
   */
  declare module "*.jpg" {
    const content: string;
    export default content;
  }
  
  /**
   * Declaration for JPEG imports
   */
  declare module "*.jpeg" {
    const content: string;
    export default content;
  }
  
  /**
   * Declaration for GIF imports
   */
  declare module "*.gif" {
    const content: string;
    export default content;
  }
  
  /**
   * Declaration for module CSS imports
   */
  declare module "*.module.css" {
    const classes: { [key: string]: string };
    export default classes;
  }
  
  /**
   * Declaration for module SCSS imports
   */
  declare module "*.module.scss" {
    const classes: { [key: string]: string };
    export default classes;
  }
  
  /**
   * Declaration for JSON imports
   */
  declare module "*.json" {
    const content: any;
    export default content;
  }
  
  /**
   * Environment variables
   */
  declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PUBLIC_URL: string;
      REACT_APP_NETWORK: string;
      REACT_APP_PACKAGE_ID: string;
      REACT_APP_STAKING_POOL_ID: string;
      REACT_APP_TARDI_COIN_TYPE: string;
      [key: string]: string | undefined;
    }
  }
  
  /**
   * Custom events for wallet interactions
   */
  interface CustomEventMap {
    'open-wallet-modal': CustomEvent<undefined>;
    'wallet-connected': CustomEvent<{ address: string }>;
    'wallet-disconnected': CustomEvent<undefined>;
    'transaction-submitted': CustomEvent<{ txId: string }>;
    'transaction-success': CustomEvent<{ txId: string }>;
    'transaction-error': CustomEvent<{ txId: string, error: string }>;
  }
  
  declare global {
    interface Document {
      addEventListener<K extends keyof CustomEventMap>(
        type: K,
        listener: (this: Document, ev: CustomEventMap[K]) => void
      ): void;
      dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): boolean;
      removeEventListener<K extends keyof CustomEventMap>(
        type: K,
        listener: (this: Document, ev: CustomEventMap[K]) => void
      ): void;
    }
  }