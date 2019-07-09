import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Camera } from "expo";
import * as Permissions from "expo-permissions";
import * as FaceDetector from "expo-face-detector";
// import * as Camera from "expo-camera";

import { AppLogic } from "./AppLogic";

class App extends React.Component {
	constructor(props) {
		super(props);
		this.logic = new AppLogic(this);
	}

	async componentDidMount() {
		const { status } = await Permissions.askAsync(Permissions.CAMERA);
		this.setState({ hasCameraPermission: status === "granted" });
	}

	render() {
		console.log(this.state);
		return (
			<View style={styles.container}>
				<Camera
					style={styles.camera}
					type={this.state.type}
					ref={ref => {
						this.camera = ref;
					}}
					onFacesDetected={this.logic.handleFacesDetected}
					onFaceDetectionError={() => console.log("Error detecting")}
					FaceDetectorSettings={{
						mode: FaceDetector.Constants.Mode.none,
						detectLandmarks: FaceDetector.Constants.Mode.none,
						runClassifications: FaceDetector.Constants.Mode.none
					}}
				/>
				<View
					style={{
						flex: 1,
						backgroundColor: "transparent",
						flexDirection: "row"
					}}
				>
					<TouchableOpacity
						style={styles.button}
						onPress={() => this.logic.snap(this.state.faceDetected)}
					>
						<Text style={styles.text}> Enroll </Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "gray"
	},
	camera: {
		flex: 1
	},
	button: {
		flex: 1,
		flexDirection: "row",
		alignSelf: "flex-end",
		alignItems: "flex-end"
	},
	text: {
		fontSize: 18,
		marginBottom: 10,
		color: "white"
	}
});

export default App;
