import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

/* Conects and Intialize Firebase */

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyDkuG9WPGHFUpNaGM14MyYN9gH91UIyauA',
	authDomain: 'arabuco-kai.firebaseapp.com',
	projectId: 'arabuco-kai',
	storageBucket: 'arabuco-kai.appspot.com',
	messagingSenderId: '103363607579',
	appId: '1:103363607579:web:7603a7ea5b270e0d7b0cbe',
	measurementId: 'G-0WWPS6E3S6',
};

firebase.initializeApp(firebaseConfig);

/*Modeling the data to fetch  */
export const createUserProfileDocument = async (userAuth, additionalData) => {
	if (!userAuth) return;
	// User Ref Object gives me access to CRUD methods & point to the location we are quering for.
	const userRef = firestore.doc(`users/${userAuth.uid}`);

	// This checks if user exists.
	const snapShot = await userRef.get();

	if (!snapShot.exists) {
		const { displayName, email } = userAuth;
		const createdAt = new Date();

		try {
			await userRef.set({
				displayName,
				email,
				createdAt,
				...additionalData,
			});
		} catch (error) {
			console.error('error creating user', error.message);
		}
	}

	return userRef;
};

// This func allow us store an entire collections on my Firebase.
export const addCollectionAndDocuments = async (
	collectionKey,
	objectsToAdd
) => {
	const collectionRef = firestore.collection(collectionKey);

	const batch = firestore.batch();
	objectsToAdd.forEach(obj => {
		const newDocRef = collectionRef.doc();
		batch.set(newDocRef, obj);
	});

	return await batch.commit();
};

// This gets the snapshot obj.
export const convertCollectionsSnapshotToMap = collections => {
	const transformedColleciton = collections.docs.map(doc => {
		const { title, items } = doc.data();

		return {
			routeName: encodeURI(title.toLowerCase()),
			id: doc.id,
			title,
			items,
		};
	});

	return transformedColleciton.reduce((accumulator, collection) => {
		accumulator[collection.title.toLowerCase()] = collection;
		return accumulator;
	}, {});
};

// This mimicks code as if we didnt have firebase.
export const getCurrentUser = () => {
	return new Promise((resolve, reject) => {
		const unsubscribe = auth.onAuthStateChanged(userAuth => {
			unsubscribe();
			resolve(userAuth);
		}, reject);
	});
};

/* Setup Sign in with Google */
export const auth = firebase.auth();
export const firestore = firebase.firestore();

export const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const signInWithGoogle = () => {
	firebase
		.auth()
		.signInWithPopup(googleProvider)
		// Optional code for handeling credentials and errors.
		.then(result => {
			let credential = result.credential;
			const token = credential.accessToken;
			const user = result.user;
		})
		.catch(error => {
			const errorCode = error.code;
			new Error(`Error number ${errorCode} has occurred.`);
		});
};
export default firebase;