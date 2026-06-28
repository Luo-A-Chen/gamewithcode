/**
 * SaveManager - 存档管理器
 * 使用 localStorage 存储游戏进度
 */
export class SaveManager {
  constructor() {
    this.SAVE_KEY = 'codechronicle_save';
    this.SETTINGS_KEY = 'codechronicle_settings';
  }

  /**
   * 保存游戏进度
   */
  save(game) {
    const data = {
      version: 1,
      timestamp: new Date().toISOString(),
      progress: {
        currentWorld: 1,
        currentLevel: game.levelManager.currentLevelName || 'level1',
        score: game.score,
        playerX: game.player ? game.player.x : 0,
        playerY: game.player ? game.player.y : 0,
        playerHP: game.player ? game.player.hp : 3,
        completedLevels: game.completedLevels || [],
      },
      collectibles: {
        collectedCoins: this._getCollectedIds(game, 'Collectible'),
        collectedFragments: this._getCollectedIds(game, 'LanguageFragment'),
        collectedBugLogs: this._getCollectedIds(game, 'BugLog'),
      },
      settings: this.loadSettings(),
    };

    try {
      localStorage.setItem(this.SAVE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('存档失败:', e);
      return false;
    }
  }

  /**
   * 读取存档
   */
  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('读档失败:', e);
      return null;
    }
  }

  /**
   * 是否有存档
   */
  hasSave() {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * 删除存档
   */
  deleteSave() {
    localStorage.removeItem(this.SAVE_KEY);
  }

  /**
   * 保存设置
   */
  saveSettings(settings) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('保存设置失败:', e);
    }
  }

  /**
   * 加载设置
   */
  loadSettings() {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      return raw ? JSON.parse(raw) : this.getDefaultSettings();
    } catch (e) {
      return this.getDefaultSettings();
    }
  }

  /**
   * 默认设置
   */
  getDefaultSettings() {
    return {
      masterVolume: 0.5,
      bgmVolume: 0.3,
      sfxVolume: 0.7,
    };
  }

  /**
   * 获取已收集物品的ID列表
   */
  _getCollectedIds(game, typeName) {
    return game.entities
      .filter(e => e.constructor.name === typeName && e.collected)
      .map(e => e.fragmentId || e.logId || e.id)
      .filter(Boolean);
  }
}
