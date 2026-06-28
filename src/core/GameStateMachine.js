import { State } from './State.js';

/**
 * GameStateMachine - 游戏状态机
 * 管理 Menu / Playing / Paused / GameOver / LevelClear 状态切换
 */
export class GameStateMachine {
  constructor(game) {
    this.game = game;
    this.states = {};
    this.current = null;
  }

  /**
   * 注册状态
   */
  register(name, state) {
    this.states[name] = state;
  }

  /**
   * 切换状态
   */
  changeState(name) {
    if (this.current) {
      this.current.exit(this.game);
    }
    this.current = this.states[name];
    if (this.current) {
      this.current.enter(this.game);
    }
  }

  /**
   * 获取当前状态名
   */
  get currentStateName() {
    var keys = Object.keys(this.states);
    for (var i = 0; i < keys.length; i++) {
      if (this.states[keys[i]] === this.current) return keys[i];
    }
    return null;
  }

  update(dt) {
    if (this.current) {
      this.current.update(this.game, dt);
    }
  }

  render() {
    if (this.current) {
      this.current.render(this.game);
    }
  }

  handleInput(input) {
    if (this.current) {
      this.current.handleInput(this.game, input);
    }
  }
}
