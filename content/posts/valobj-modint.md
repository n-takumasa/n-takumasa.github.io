---
date: 2023-04-19T17:30:00+09:00
title: "Pythonで値オブジェクトっぽいModint"
description: ""
tags: ["Python", "dataclass"]
---

# こだわりポイント
* Immutableいいよね
* `mod`が異なる`Modint`同士の演算を防止
* 制約や規則は極力クラス外に定義、`__truediv__`だけ諦めた
* 競プロ目的ではないため速度には無頓着

# コード

```py:modint.py
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from functools import wraps
from typing import Self, SupportsInt, TypeAlias

from sympy import mod_inverse as _mod_inverse

# NOTE mod 素数 だけでいいなら:
# from functools import lru_cache
# @lru_cache(maxsize=None)
# def _isprime(n: int):
#     if n in {2, 3}:
#         return True
#     if n % 2 == 0 or n < 2:
#         return False
#     return all(n % i != 0 for i in range(3, int(n**0.5) + 1, 2))

# def _mod_inverse(a: int, m: int):
#     if _isprime(m):
#         return pow(a, m - 2, m)
#     raise ValueError(f"{m} is not prime")

_ModintMethod: TypeAlias = Callable[["Modint", "Modint | SupportsInt"], "Modint"]


def _ensure_mod_equals(func: _ModintMethod) -> _ModintMethod:
    """dunder-method で self.mod と other.mod が一致することを保証する"""

    @wraps(func)
    def inner(self: Modint, other: Modint | SupportsInt) -> Modint:
        if isinstance(other, Modint) and self.mod != other.mod:
            msg = f"{self.mod=} != {other.mod=}"
            raise ValueError(msg)
        return func(self, other)

    return inner


@dataclass(frozen=True, slots=True)
class Modint:
    num: int
    mod: int

    # NOTE init, repr, eq は @dataclass が実装するものに任せる
    # NOTE eq と frozen のため、hashable になる

    @property
    def inverse(self) -> int:
        # NOTE `cached_property` では `__slots__` を使えない
        # 内部の関数を `lru_cache` すれば使える
        # `sympy.isprime` は篩を共有しているから `lru_cache` を付けるのはナンセンス
        return _mod_inverse(self.num, self.mod)

    def __post_init__(self) -> None:
        # NOTE `frozen=True` で引数の加工をする場合、`object.__setattr__` 経由でバイパスする
        if not (0 <= self.num < self.mod):
            object.__setattr__(self, "num", self.num % self.mod)

    def __int__(self) -> int:
        return self.num

    def __str__(self) -> str:
        return str(self.num)

    @_ensure_mod_equals
    def __add__(self, other: Self | SupportsInt) -> Self:
        return self.__class__(int(self) + int(other), self.mod)

    @_ensure_mod_equals
    def __sub__(self, other: Self | SupportsInt) -> Self:
        return self.__class__(int(self) - int(other), self.mod)

    @_ensure_mod_equals
    def __mul__(self, other: Self | SupportsInt) -> Self:
        return self.__class__(int(self) * int(other), self.mod)

    @_ensure_mod_equals
    def __truediv__(self, other: Self | SupportsInt) -> Self:
        inv = (
            other.inverse
            if isinstance(other, self.__class__)
            else _mod_inverse(int(other), self.mod)
        )
        return self.__class__(int(self) * inv, self.mod)

    @_ensure_mod_equals
    def __pow__(self, power: Self | SupportsInt) -> Self:
        return self.__class__(pow(int(self), int(power), self.mod), self.mod)

    @_ensure_mod_equals
    def __rsub__(self, other: Self | SupportsInt) -> Self:
        return self.__class__(-int(self) + int(other), self.mod)

    @_ensure_mod_equals
    def __rtruediv__(self, other: Self | SupportsInt) -> Self:
        return self.__class__(self.inverse * int(other), self.mod)

    __radd__ = __add__
    __rmul__ = __mul__
    __floordiv__ = __truediv__
    __rfloordiv__ = __rtruediv__
```

```py:test_modint.py
from dataclasses import FrozenInstanceError

import pytest
from modint import Modint


def test_normal():
    x = Modint(10, 998244353)
    y = Modint(7, 998244353)

    assert int(x + y) == 17
    assert int(x - y) == 3
    assert int(x * y) == 70
    assert int(x / y) == 570425346
    assert int(x // y) == 570425346
    assert int(y**5) == 16807
    assert x != y

    x += y
    assert int(x) == 17
    x -= y
    assert int(x) == 10
    x *= y
    assert int(x) == 70
    x /= y
    assert int(x) == 10
    x //= y
    assert int(x) == 570425346

    assert int(x + 5) == 570425351
    assert int(22 + y) == 29

    assert x.inverse == 99824436


def test_not_same_mod():
    with pytest.raises(ValueError):
        _ = Modint(1, 7) + Modint(1, 3)


def test_frozen():
    x = Modint(1, 7)

    with pytest.raises(FrozenInstanceError):
        x.num = 42  # type: ignore

    with pytest.raises(FrozenInstanceError):
        x.mod = 42  # type: ignore
```

# 参考文献

* https://qiita.com/hyouchun/items/4024845d6783c8dacc77
* https://qiita.com/wotsushi/items/c936838df992b706084c
* https://qiita.com/AkariLuminous/items/dc5c81fa9d945440afa0
