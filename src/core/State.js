/**
 * State - 状态基类
 * 所有游戏状态继承此类
 */
export class State {
  enter(game) {}        // 进入状态时调用
  exit(game) {}         // 退出状态时调用
  update(game, dt) {}   // 每帧更新
  render(game) {}       // 每帧渲染
  handleInput(game, input) {} // 处理输入
}
