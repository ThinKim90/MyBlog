---
title: "React Hooks 완벽 가이드"
date: "2024-01-25"
description: "React Hooks의 기본부터 고급 활용까지 모든 것을 다룹니다."
category: "React"
---

# React Hooks 완벽 가이드

React Hooks는 함수형 컴포넌트에서 상태와 생명주기 기능을 사용할 수 있게 해주는 강력한 기능입니다.

## 기본 Hooks

### useState

가장 기본적인 Hook으로 컴포넌트에 상태를 추가할 수 있습니다.

```javascript
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>현재 카운트: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        증가
      </button>
    </div>
  );
}
```

### useEffect

컴포넌트의 사이드 이펙트를 처리할 때 사용합니다.

```javascript
import React, { useState, useEffect } from 'react';

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <div>경과 시간: {seconds}초</div>;
}
```

## 고급 Hooks

### useContext

Context API와 함께 사용하여 전역 상태를 관리할 수 있습니다.

### useReducer

복잡한 상태 로직을 관리할 때 useState보다 효과적입니다.

### useMemo & useCallback

성능 최적화를 위한 Hook들입니다.

## 커스텀 Hooks

자주 사용하는 로직을 재사용 가능한 Hook으로 만들 수 있습니다.

```javascript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
```

React Hooks를 마스터하면 더 깔끔하고 재사용 가능한 컴포넌트를 작성할 수 있습니다! 🚀 