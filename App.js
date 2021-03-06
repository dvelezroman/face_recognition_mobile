import React from "react";
import {
	ActivityIndicator,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	TouchableHighlight,
	TextInput,
	Modal
} from "react-native";
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
		this.setState({
			hasCameraPermission: status === "granted"
		});
	}

	render() {
		return (
			<View style={styles.container}>
				<TextInput
					style={styles.input}
					placeholder="Type your Name"
					value={this.state.name}
					onChangeText={name => this.setState({ name })}
				/>
				{this.state.hasCameraPermission && !this.state.working ? (
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
				) : (
					<ActivityIndicator size="large" color="#0000ff" />
				)}
				<View style={styles.buttons}>
					<TouchableOpacity
						style={styles.button}
						onPress={() => this.logic.snap(true)}
					>
						<Text style={styles.text}> Enroll </Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.button}
						onPress={() => this.logic.snap(false)}
					>
						<Text style={styles.text}> Recognize </Text>
					</TouchableOpacity>
				</View>
				<Modal
					animationType="slide"
					transparent={false}
					visible={this.state.recognizeResponse.status}
					onRequestClose={() => {
						Alert.alert("Modal has been closed.");
					}}
				>
					<View style={{ marginTop: 22 }}>
						<View>
							<Text style={{ paddingBottom: 20, fontSize: 25 }}>
								{this.state.recognizeResponse.name != "unknow"
									? `You are ${this.state.recognizeResponse.name}`
									: `You are not ${this.state.name}`}
							</Text>

							<TouchableHighlight
								onPress={() => {
									const { recognizeResponse } = this.state;
									recognizeResponse.status = false;
									recognizeResponse.name = "unknow";
									this.setState({ recognizeResponse });
								}}
							>
								<Text>Okay</Text>
							</TouchableHighlight>
						</View>
					</View>
				</Modal>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "gray"
	},
	input: {
		flex: 1,
		paddingTop: 10,
		paddingLeft: 10
	},
	camera: {
		flex: 8,
		paddingBottom: 10
	},
	modal: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		flexDirection: "column"
	},
	buttons: {
		flex: 1,
		backgroundColor: "transparent",
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center"
	},
	button: {
		flex: 2,
		flexDirection: "row",
		justifyContent: "center"
	},
	text: {
		fontSize: 18,
		marginBottom: 10,
		color: "white"
	}
});

export default App;
