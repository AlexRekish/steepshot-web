import Steem from '../libs/steem';
import {getStore} from '../store/configureStore';
import Constants from '../common/constants';
import {debounce} from 'lodash';
import {updatePost} from './post';
import {getUserProfile} from './profile';
import {updateVotingPower} from './auth';

function toggleFlagRequest(postIndex) {
  return {
    type: 'TOGGLE_FLAG_REQUEST',
    index: postIndex,
  };
}

function toggleFlagSuccess(postIndex) {
  return {
    type: 'TOGGLE_FLAG_SUCCESS',
    index: postIndex,
  };
}

function toggleFlagFailure(postIndex) {
  return {
    type: 'TOGGLE_FLAG_FAILURE',
    index: postIndex,
  };
}

export function toggleFlag(postIndex) {
  return function(dispatch) {
    let state = getStore().getState();
    let username = state.auth.user;
    let postingKey = state.auth.postingKey;
    let post = state.posts[postIndex];
    const newFlagState = !post.flag;

    if (!username && !postingKey) {
      debounce(jqApp.pushMessage.open(Constants.VOTE_ACTION_WHEN_NOT_AUTH), Constants.VOTE_ACTION_WHEN_NOT_AUTH_DEBOUNCE);
      return;
    }
    let queue = sessionStorage.getItem('voteQueue');
    if (queue === 'true')  {
      return;
    }
    sessionStorage.setItem('voteQueue', 'true');

    dispatch(toggleFlagRequest(postIndex));

    const callback = (err, success) => {
      getUserProfile(username).then((result) => {
        sessionStorage.setItem('voteQueue', 'false');
        if (err) {
          dispatch(toggleFlagFailure(postIndex));
          let text = 'Something went wrong when you clicked the flag, please, try again later';
          if (err.data.code === 10) {
            text = 'Sorry, you had used the maximum number of vote changes on this post';
          }
          jqApp.pushMessage.open(text);
        } else if (success) {
          dispatch(toggleFlagSuccess(postIndex));
          dispatch(updatePost(postIndex));
          dispatch(updateVotingPower(result.voting_power));
          let text = `The post has been successfully flaged. If you don't see your flag, please give it a few minutes to sync from the blockchain`;
          if (!newFlagState) text = `The post has been successfully unflaged. If you don't see your flag, please give it a few minutes to sync from the blockchain`;
          jqApp.pushMessage.open(text);
        }
      });
    };

    let urlObject = post.url.split('/');
    Steem.flag(postingKey,
      username,
      post.author,
      urlObject[urlObject.length - 1],
      newFlagState,
      callback,
    );
  };
}
