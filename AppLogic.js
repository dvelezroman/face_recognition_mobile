import * as Camera from "expo-camera";
import axios from "axios";
import { BASE_URL, ENDPOINTS, APP_KEY, APP_ID } from "./config";
import uuid from "uuid/v4";

export class AppLogic {
	constructor(Container) {
		this.setState = Container.setState.bind(Container);
		Container.state = {
			hasCameraPermission: null,
			working: false,
			name: "unknow",
			faces: [],
			recognizing: false,
			faceDetected: false,
			recognizeResponse: {
				status: false,
				name: "unknow"
			},
			type: Camera.Constants.Type.front
		};
		this.camera = Container.camera;
		this.state = Container.state;
		this.props = Container.props;
		this.snap = this.snap.bind(Container);
		this.handleFacesDetected = this.handleFacesDetected.bind(Container);
		this.resolvePersonName = this.resolvePersonName.bind(Container);
		this.recognize = this.recognize.bind(Container);
		this.enroll = this.enroll.bind(Container);
	}

	handleFacesDetected({ faces }) {
		if (faces.length > 0) {
			this.setState({ faces, faceDetected: true });
		}
	}

	resolvePersonName(candidates) {
		const response = {
			status: true,
			name: "unknow"
		};
		candidates.forEach(candidate => {
			if (candidate.subject_id === this.state.name) {
				response.name = candidate.subject_id;
			}
		});
		return response;
	}

	async snap(recognize) {
		try {
			this.setState({ working: true });
			if (this.state.name != "unknow" && this.camera) {
				this.setState({ recognizing: true });
				const photo = await this.camera.takePictureAsync({
					quality: 0.1,
					base64: true
				});
				if (!this.state.faceDetected) {
					alert("No face detected");
					return;
				}
				const { base64 } = photo;
				const response = recognize
					? await this.logic.enroll({ name: this.state.name, base64 })
					: await this.logic.recognize({ base64 });
				if (recognize) return "Enrolled";
				else {
					const recognizeResponse = this.logic.resolvePersonName(
						response.images[0].candidates
					);
					this.setState({ recognizeResponse, recognizing: false });
				}
				this.setState({ working: false });
			}
		} catch (error) {
			console.error(error);
		}
	}

	// Enroll Method
	async enroll({ name, base64 }) {
		try {
			const response = await axios.post(
				`https://api.kairos.com/verify`,
				{
					gallery_name: "MyGallery",
					image: base64,
					subject_id: name
				},
				{
					headers: {
						app_id: APP_ID,
						app_key: APP_KEY
					}
				}
			);
			return response.data;
		} catch (error) {
			return error;
		}
	}

	// Recognize Method
	async recognize({ base64 }) {
		try {
			const response = await axios.post(
				`https://api.kairos.com/recognize`,
				{
					gallery_name: "MyGallery",
					image: base64
				},
				{
					headers: {
						app_id: APP_ID,
						app_key: APP_KEY
					}
				}
			);

			return response.data;
		} catch (error) {
			return error;
		}
	}
}
