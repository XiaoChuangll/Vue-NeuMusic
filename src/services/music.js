import request from './request.js'

// 音乐相关 API
export const musicApi = {
  // 搜索音乐
  search(keywords, type = 1, limit = 30, offset = 0) {
    return request({
      url: '/search',
      method: 'get',
      params: {
        keywords,
        type,
        limit,
        offset,
      },
    })
  },

  // 获取歌曲详情
  getSongDetail(ids) {
    return request({
      url: '/song/detail',
      method: 'get',
      params: {
        ids: Array.isArray(ids) ? ids.join(',') : ids,
      },
    })
  },

  // 获取歌曲播放URL
  getSongUrl(id, br = 320000) {
    return request({
      url: '/song/url',
      method: 'get',
      params: {
        id,
        br,
      },
    })
  },

  // 获取歌词
  getLyric(id) {
    return request({
      url: '/lyric',
      method: 'get',
      params: {
        id,
      },
    })
  },

  // 获取歌单详情
  getPlaylistDetail(id) {
    return request({
      url: '/playlist/detail',
      method: 'get',
      params: {
        id,
      },
    })
  },

  // 获取歌单所有歌曲
  getPlaylistTracks(id, limit = 1000, offset = 0) {
    return request({
      url: '/playlist/track/all',
      method: 'get',
      params: {
        id,
        limit,
        offset,
      },
    })
  },

  // 获取推荐歌单
  getPersonalized(limit = 10) {
    return request({
      url: '/personalized',
      method: 'get',
      params: {
        limit,
      },
    })
  },

  // 获取推荐新音乐
  getPersonalizedNewsong(limit = 10) {
    return request({
      url: '/personalized/newsong',
      method: 'get',
      params: {
        limit,
      },
    })
  },

  // 获取每日推荐歌单
  getRecommendResource() {
    return request({
      url: '/recommend/resource',
      method: 'get',
    })
  },

  // 获取每日推荐歌曲
  getRecommendSongs() {
    return request({
      url: '/recommend/songs',
      method: 'get',
    })
  },

  // 获取热门歌手
  getTopArtists({ area = -1, type = -1, limit = 50, offset = 0 } = {}) {
    return request({
      url: '/top/artists',
      method: 'get',
      params: {
        area,
        type,
        limit,
        offset,
      },
    })
  },

  // 获取歌手详情
  getArtistDetail(id) {
    return request({
      url: '/artist/detail',
      method: 'get',
      params: {
        id,
      },
    })
  },

  // 获取歌手热门歌曲
  getArtistTopSongs(id) {
    return request({
      url: '/artist/top/song',
      method: 'get',
      params: {
        id,
      },
    })
  },

  // 获取专辑详情
  getAlbumDetail(id) {
    return request({
      url: '/album',
      method: 'get',
      params: {
        id,
      },
    })
  },

  // 获取轮播图
  getBanner(type = 0) {
    return request({
      url: '/banner',
      method: 'get',
      params: {
        type,
      },
    })
  },

  // 获取热门歌单分类
  getTopPlaylists(cat = '', limit = 50, offset = 0) {
    return request({
      url: '/top/playlist',
      method: 'get',
      params: {
        cat,
        limit,
        offset,
      },
    })
  },

  // 获取所有榜单
  getToplistDetail() {
    return request({
      url: '/toplist/detail',
      method: 'get',
    })
  },

  // 喜欢音乐
  likeSong(id, like = true) {
    return request({
      url: '/like',
      method: 'get',
      params: {
        id,
        like: like ? 'true' : 'false',
      },
    })
  },

  // 获取相似音乐
  getSimiSong(id) {
    return request({
      url: '/simi/song',
      method: 'get',
      params: {
        id,
      },
    })
  },

  // 获取音乐评论
  getSongComments(id, limit = 20, offset = 0) {
    return request({
      url: '/comment/music',
      method: 'get',
      params: {
        id,
        limit,
        offset,
      },
    })
  },

  // 获取热门搜索
  getSearchHot() {
    return request({
      url: '/search/hot',
      method: 'get',
    })
  },

  // 获取搜索建议
  getSearchSuggest(keywords) {
    return request({
      url: '/search/suggest',
      method: 'get',
      params: {
        keywords,
      },
    })
  },
}