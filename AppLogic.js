import React from "react";
import * as Camera from "expo-camera";
import axios from "axios";
import { BASE_URL, headers, ENDPOINTS } from "./config";
import uuid from "uuid/v4";

export class AppLogic {
	constructor(Container) {
		this.setState = Container.setState.bind(Container);
		Container.state = {
			hasCameraPermission: null,
			faces: [],
			faceDetected: false,
			type: Camera.Constants.Type.front
		};
		this.camera = Container.camera;
		this.state = Container.state;
		this.props = Container.props;
		this.snap = this.snap.bind(Container);
		this.handleFacesDetected = this.handleFacesDetected.bind(Container);
		this.recognize = this.recognize.bind(Container);
		this.enroll = this.enroll.bind(Container);
	}

	handleFacesDetected({ faces }) {
		if (faces.length > 0) {
			this.setState({ faces, faceDetected: true });
		}
	}

	async snap(recognize) {
		try {
			if (this.camera) {
				const photo = await this.camera.takePictureAsync({
					quality: 0.1,
					base64: true
				});
				if (!this.state.faceDetected) {
					alert("No face detected");
					return;
				}
				const userId = uuid();

				const { base64 } = photo;
				const response = recognize
					? await this.logic.enroll({ userId, base64 })
					: await this.logic.recognize({ userId, base64 });
				console.log(response);
			}
		} catch (error) {
			console.error(error);
		}
	}

	// Enroll Method
	async enroll({ userId, base64 }) {
		console.log({
			gallery_name: "MyGallery",
			image: JSON.stringify(base64),
			subject_id: userId
		});
		try {
			const response = await axios.post(
				`https://api.kairos.com/enroll`,
				{
					gallery_name: "MyGallery",
					image: base64,
					subject_id: userId
				},
				{
					headers: {
						app_id: "1f10f57e",
						app_key: "59785188afbcd0b34a49d10ba4175949"
					}
				}
			);
			return response.data;
		} catch (error) {
			return error;
		}
	}

	// Recognize Method
	async recognize(base64) {
		const rawResponse = await fetch(`${BASE_URL + ENDPOINTS.recognize}`, {
			method: "POST",
			headers,
			body: JSON.stringify({
				image: base64,
				gallery_name: "MyGallery"
			})
		});
		return rawResponse;
	}
}
