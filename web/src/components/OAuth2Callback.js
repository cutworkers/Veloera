/*
Copyright (c) 2025 Tethys Plex

This file is part of Veloera.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/
import React, { useContext, useEffect, useState } from 'react';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API, showError, showSuccess, updateAPI } from '../helpers';
import { UserContext } from '../context/User';
import { setUserData } from '../helpers/data.js';

const OAuth2Callback = (props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [userState, userDispatch] = useContext(UserContext);
  const [prompt, setPrompt] = useState('处理中...');
  const [processing, setProcessing] = useState(true);

  let navigate = useNavigate();

  const sendCode = async (code, state, count) => {
    const res = await API.get(
      `/api/oauth/${props.type}?code=${code}&state=${state}`,
    );
    const { success, message, data } = res.data;
    if (success) {
      if (message === 'bind') {
        showSuccess('绑定成功！');
        navigate('/admin/settings');
      } else {
        userDispatch({ type: 'login', payload: data });
        localStorage.setItem('user', JSON.stringify(data));
        setUserData(data);
        updateAPI();
        showSuccess('登录成功！');
        navigate(searchParams.get('returnTo') || '/app/tokens');
      }
    } else {
      showError(message);
      if (count === 0) {
        setPrompt(`操作失败，重定向至登录界面中...`);
        navigate('/admin/settings'); // in case this is failed to bind GitHub
        return;
      }
      count++;
      setPrompt(`出现错误，第 ${count} 次重试中...`);
      await new Promise((resolve) => setTimeout(resolve, count * 2000));
      await sendCode(code, state, count);
    }
  };

  useEffect(() => {
    let code = searchParams.get('code');
    let state = searchParams.get('state');
    sendCode(code, state, 0).then();
  }, []);

  return (
    <Segment style={{ minHeight: '300px' }}>
      <Dimmer active inverted>
        <Loader size='large'>{prompt}</Loader>
      </Dimmer>
    </Segment>
  );
};

export default OAuth2Callback;
