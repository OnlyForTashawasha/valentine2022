
export const assetsPath = `./assets`

export const GAMEASSETS: AssetMap = {
  models: {
    mrborker: `${assetsPath}/mrborker/mrborker.fbx`,
    sandwitch: `${assetsPath}/sandwitch/sandwitch.fbx`
  },
  animations: {
    playerRunAnim: `${assetsPath}/mrborker/run.fbx`,
    playerMoveRightAnim: `${assetsPath}/mrborker/runRight.fbx`,
    playerMoveLeftAnim: `${assetsPath}/mrborker/runLeft.fbx`,
    playerIdleAnim: `${assetsPath}/mrborker/idle.fbx`,
    playerAirborneAnim: `${assetsPath}/mrborker/airborne.fbx`,
    playerHappyAnim: `${assetsPath}/mrborker/happy.fbx`,
    playerDeathAnim: `${assetsPath}/mrborker/death.fbx`,
    sandwitchIdleAnim: `${assetsPath}/sandwitch/idle.fbx`,
    sandwitchJumpAttackAnim: `${assetsPath}/sandwitch/jumpAttack.fbx`,
    sandwitchLaughAnim: `${assetsPath}/sandwitch/laugh.fbx`,
    sandwitchThrowAnim: `${assetsPath}/sandwitch/throw.fbx`,
  },
  textures: {
    alert: `${assetsPath}/alert.png`
  },
  images: [
    `${assetsPath}/mrborker/angry.png`,
    `${assetsPath}/mrborker/disappointed.png`,
    `${assetsPath}/mrborker/happy.png`,
    `${assetsPath}/mrborker/neutral.png`,
    `${assetsPath}/mrborker/sad.png`,
    `${assetsPath}/mrborker/shocked.png`,
    `${assetsPath}/mrborker/sly.png`,
    `${assetsPath}/sandwitch/angry.png`,
    `${assetsPath}/sandwitch/cough.png`,
    `${assetsPath}/sandwitch/laugh.png`,
    `${assetsPath}/sandwitch/neutral.png`,
    `${assetsPath}/sandwitch/serious.png`,
    `${assetsPath}/sandwitch/weird.png`,
  ]
}

export type AssetMap = {
  models: {
    [key: string]: string;
  }
  animations: {
    [key: string]: string;
  }
  textures: {
    [key: string]: string;
  }
  // List of images to preload
  images: Array<string>
}