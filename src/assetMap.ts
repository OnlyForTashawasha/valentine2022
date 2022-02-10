
export const GAMEASSETS: AssetMap = {
  models: {
    mrborker: '../assets/mrborker/mrborker.fbx',
    sandwitch: '../assets/sandwitch/sandwitch.fbx'
  },
  animations: {
    playerRunAnim: '../assets/mrborker/run.fbx',
    playerMoveRightAnim: '../assets/mrborker/runRight.fbx',
    playerMoveLeftAnim: '../assets/mrborker/runLeft.fbx',
    playerIdleAnim: '../assets/mrborker/idle.fbx',
    playerAirborneAnim: '../assets/mrborker/airborne.fbx',
    playerHappyAnim: '../assets/mrborker/happy.fbx',
    playerDeathAnim: '../assets/mrborker/death.fbx',
    sandwitchIdleAnim: '../assets/sandwitch/idle.fbx',
    sandwitchJumpAttackAnim: '../assets/sandwitch/jumpAttack.fbx',
    sandwitchLaughAnim: '../assets/sandwitch/laugh.fbx',
    sandwitchThrowAnim: '../assets/sandwitch/throw.fbx',
  },
  textures: {
    alert: '../assets/alert.png'
  },
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
}