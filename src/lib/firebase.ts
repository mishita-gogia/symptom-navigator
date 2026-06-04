import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// We use a defensive strategy to allow the app to boot even if Firebase is not yet configured
let db: any = null;
let auth: any = null;

const initializeFirebase = async () => {
    try {
        // Bypass Rollup compile-time analyzer using string interpolation / dynamic variables
        const pathVar = '../../firebase-applet-config.json';
        // @ts-ignore
        const config = await import(/* @vite-ignore */ pathVar);
        
        if (!getApps().length) {
            const app = initializeApp(config.default);
            db = getFirestore(app, config.default.firestoreDatabaseId);
            auth = getAuth(app);
        } else {
            const app = getApp();
            db = getFirestore(app);
            auth = getAuth(app);
        }
    } catch (error) {
        console.warn('Firebase configuration missing. Database features will be unavailable until setup is complete.');
    }
};

initializeFirebase();

export { db, auth };
