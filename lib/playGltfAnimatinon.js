export const playGLTFAnimation = (gltf) => {
  const mixer = new THREE.AnimationMixer(gltf.scene)
  const animation = gltf.scene.animations[0]
  const action = mixer.clipAction(animation)
  action.play()
  return mixer
}
