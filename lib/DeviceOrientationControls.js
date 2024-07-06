( function () {

  const _zee = new THREE.Vector3( 0, 0, 1 );

  const _euler = new THREE.Euler();

  const _q0 = new THREE.Quaternion();

  const _q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) );
  const _changeEvent = {
    type: 'change'
  };

  class DeviceOrientationControls extends THREE.EventDispatcher {

    constructor( object ) {

      super();

      if ( window.isSecureContext === false ) {

        console.error( 'THREE.DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)' );

      }

      const scope = this;
      const EPS = 0.000001;
      const lastQuaternion = new THREE.Quaternion();
      this.object = object;
      this.object.rotation.reorder( 'YXZ' );
      this.enabled = true;
      this.deviceOrientation = {};
      this.screenOrientation = 0;
      this.alphaOffset = 0; // radians

      let deviceOrientationCount = 0;
      let lastDeviceEvent = null;

      const onDeviceOrientationChangeEvent = function ( event ) {
        if (event.alpha != null && event.beta != null && event.gamma != null
          && (!lastDeviceEvent
            || lastDeviceEvent.alpha !== event.alpha
            || lastDeviceEvent.beta !== event.beta
            || lastDeviceEvent.gamma !== event.gamma)) {
          deviceOrientationCount++;
          if(deviceOrientationCount === 4) {
            // Set alphaOffset to initial alpha so it becomes zero
            scope.alphaOffset = THREE.MathUtils.degToRad(event.alpha);
          }
          if(deviceOrientationCount > 3) {
            scope.deviceOrientation = event;
          }
        }
        lastDeviceEvent = event;
      };

      let screenOrientationCount = 0;
      let lastScreenOrientation = null;

      const onScreenOrientationChangeEvent = function () {
        let orientation = window.orientation || 0;
        if (orientation !== undefined && orientation !== lastScreenOrientation){
          screenOrientationCount++;
          if(screenOrientationCount > 3) {
            scope.screenOrientation = orientation;
          }
        }
        lastScreenOrientation = orientation;
      };

      const setObjectQuaternion = function ( quaternion, alpha, beta, gamma, orient ) {
        _euler.set( beta, alpha, - gamma, 'YXZ' );
        quaternion.setFromEuler( _euler );
        quaternion.multiply( _q1 );
        quaternion.multiply( _q0.setFromAxisAngle( _zee, - orient ) );
      };

      this.connect = function () {
        onScreenOrientationChangeEvent();
        if ( window.DeviceOrientationEvent !== undefined && typeof window.DeviceOrientationEvent.requestPermission === 'function' ) {
          window.DeviceOrientationEvent.requestPermission().then( function ( response ) {
            if ( response === 'granted' ) {
              window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );
              window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );
            }
          } ).catch( function ( error ) {
            console.error( 'THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error );
          } );
        } else {
          window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent );
          window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );
        }
        scope.enabled = true;
      };

      this.disconnect = function () {
        window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent );
        window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent );
        scope.enabled = false;
      };

      this.update = function () {
        if ( scope.enabled === false ) return;
        const device = scope.deviceOrientation;
        if ( device ) {
          const alpha = device.alpha ? THREE.MathUtils.degToRad( device.alpha ) + scope.alphaOffset : 0;
          const beta = device.beta ? THREE.MathUtils.degToRad( device.beta ) : 0;
          const gamma = device.gamma ? THREE.MathUtils.degToRad( device.gamma ) : 0;
          const orient = scope.screenOrientation ? THREE.MathUtils.degToRad( scope.screenOrientation ) : 0;
          setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );
          if ( 8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {
            lastQuaternion.copy( scope.object.quaternion );
            scope.dispatchEvent( _changeEvent );
          }
        }
      };

      this.dispose = function () {
        scope.disconnect();
      };

      this.connect();

    }

  }

  THREE.DeviceOrientationControls = DeviceOrientationControls;

} )();