import OrbitControlModule from "three-orbit-controls";
import * as Three from "three";
const OrbitControls = OrbitControlModule( Three );

export default {
	name: "OrthographicViewport",
	template: `
		<div class="viewport orthographic"
			v-on:mousedown="mousedown"
			v-on:mousemove="mousemove"
			v-on:mouseup="mouseup"
		>
			<svg class="layer2D"></svg>
			<canvas class="layer3D"></canvas>
		</div>
	`,
	props: [ "options", "view" ],
	data() {
		return {
			raycaster: new Three.Raycaster(),
			mouse: new Three.Vector2(),
			width: 0,
			height: 0
		};
	},
	mounted() {
		this.width = this.$el.offsetWidth;
		this.height = this.$el.offsetHeight;

		let frustumSize = 8;
		this.camera = new Three.OrthographicCamera(
			frustumSize * this.aspect / -2,
			frustumSize * this.aspect / 2,
			frustumSize / 2,
			frustumSize / -2,
			1,
			1024
		);
		/*
		this.camera = new Three.PerspectiveCamera( 45, this.aspect, 1, 10000 );
		*/
		console.log("View: ", this.view );
		switch ( this.view ) {
			case "top":
				this.camera.position.set( 0, 0, 8 );
				break;
			case "bottom":
				this.camera.position.set( 0, 0, -8 );
				break;
			case "front":
				this.camera.position.set( 0, -8, 0 );
				break;
			case "back":
				this.camera.position.set( 0, 8, 0 );
				break;
			case "left":
				this.camera.position.set( -8, 0, 0 );
				break;
			case "right":
				this.camera.position.set( 8, 0, 0 );
				break;
		}
		this.camera.up.set( 0, 0, 1 );
		this.camera.lookAt( new Three.Vector3( 0, 0, 0 ) );

		this.renderer = new Three.WebGLRenderer({
			alpha: true,
			antialias: false,
			canvas: this.$el.getElementsByTagName("canvas")[ 0 ]
		});
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( this.width, this.height );
		this.controls = new OrbitControls( this.camera, this.$el );
		this.controls.enabled = true;

		// Start the rendering loop:
		this.loop();
	},
	computed: {
		aspect() {
			return this.width / this.height;
		}
	},
	methods: {
		loop() {
			this.renderer.render( this.$store.state.scene, this.camera );
			requestAnimationFrame( this.loop );
		},

		// Returns position in 2D coordinates for point in 3D space:
		getPosition2D: function( point, camera, callback ) {
			let result = point.clone().project( camera );
			if ( typeof callback === "function" ) {
				callback( result );
				return;
			}
			return result;
		},
		// Normalize 2D coordinates to center (camera):
		normalizeToCenter( point, el, callback ) {
			let result = new Three.Vector2();
			result.x = ( point.x / el.clientWidth ) * 2 - 1;
			result.y = -( point.y / el.clientHeight ) * 2 + 1;
			if ( typeof callback === "function" ) {
				callback( result );
				return;
			}
			return result;
		},
		// Normalize 2D coordinates to corner (typical HTML):
		normalizeToCorner( point, el ) {
			return new Three.Vector2(
				point.x * (el.clientWidth / 2) + el.clientWidth / 2,
				-1 * point.y * (el.clientHeight / 2) + el.clientHeight / 2
			);
		},
		raycast(type) {
			let intersects, position;
			position = this.normalizeToCenter( this.mouse, this.$el );
			this.raycaster.setFromCamera( position, this.camera );
			intersects = this.raycaster.intersectObjects( this.$store.state.scene.children, true );
			if ( intersects.length > 0 ) {
				// Emit event to parent component to handle!
			}
		},
		// Mouse move:
		mousemove(e) {
			this.mouse.x = e.offsetX;
			this.mouse.y = e.offsetY;
			this.raycast("mousemove");
		},
		// Mouse down:
		mousedown(e) {
			this.raycast("mousedown");
		},
		// Mouse up:
		mouseup(e) {
			this.raycast("mouseup");
		},

		onWindowResize() {
			var aspect = window.innerWidth / window.innerHeight;
			camera.left   = -frustumSize * aspect / 2;
			camera.right  =   frustumSize * aspect / 2;
			camera.top    =   frustumSize / 2;
			camera.bottom = -frustumSize / 2;
			camera.updateProjectionMatrix();
			renderer.setSize( window.innerWidth, window.innerHeight );
		}

	}
};
