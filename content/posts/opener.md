---
date: 2023-08-30T11:09:45+09:00
title: "PythonでWin32APIのCreateFile(W)を使う"
description: ""
tags: ["Python", "Win32API", "CreateFile"]
---

# メモ
* globalsを汚さない
* `flags` から `CreateFile` の `dwCreationDisposition` を生成, まちがってたらごめんね
* `os.O_NOINHERIT` を正しく処理するには `lpSecurityAttributes` を用意する必要があるかも

# コード

```py:opener.py
def sharing(share: str | None = None):
    """`Win32API:CreateFileW` を使用してファイルを開く `opener` のファクトリ関数

    Parameters
    ----------
    share, optional
        ファイルまたはデバイスの要求された共有モード, by default None
        None: 後続のオープン操作を禁止する (0)
        contains "d": 削除操作を許可する (FILE_SHARE_DELETE)
        contains "r": 読み取りアクセスを許可する (FILE_SHARE_READ)
        contains "w": 書き込みアクセスを許可する (FILE_SHARE_WRITE)

    Returns
    -------
    `open()` の引数に使用する `opener()`

    Raises
    ------
    ctypes.WinError
    """
    import ctypes
    import ctypes.wintypes
    import msvcrt
    import os

    # https://learn.microsoft.com/ja-jp/windows/win32/api/fileapi/nf-fileapi-createfilew
    CreateFileW = ctypes.windll.kernel32.CreateFileW
    CreateFileW.restype = ctypes.wintypes.HANDLE
    CreateFileW.argtypes = (
        ctypes.wintypes.LPCWSTR,
        ctypes.wintypes.DWORD,
        ctypes.wintypes.DWORD,
        ctypes.wintypes.LPVOID,
        ctypes.wintypes.DWORD,
        ctypes.wintypes.DWORD,
        ctypes.wintypes.HANDLE,
    )

    GENERIC_READ = 0x80000000
    GENERIC_WRITE = 0x40000000

    FILE_SHARE_DELETE = 0b100
    FILE_SHARE_READ = 0b001
    FILE_SHARE_WRITE = 0b010

    CREATE_NEW = 1
    CREATE_ALWAYS = 2
    OPEN_EXISTING = 3
    OPEN_ALWAYS = 4
    # TRUNCATE_EXISTING = 5

    FILE_ATTRIBUTE_NORMAL = 0x80
    INVALID_HANDLE_VALUE = ctypes.wintypes.HANDLE(-1).value

    share_mode = 0
    if share is not None:
        if "d" in share.lower():
            share_mode |= FILE_SHARE_DELETE
        if "r" in share.lower():
            share_mode |= FILE_SHARE_READ
        if "w" in share.lower():
            share_mode |= FILE_SHARE_WRITE

    def opener(path: str, flags: int) -> int:
        if flags & os.O_RDWR:
            access = GENERIC_READ | GENERIC_WRITE
        elif flags & os.O_WRONLY:
            access = GENERIC_WRITE
        else:
            access = GENERIC_READ

        if flags & os.O_CREAT:
            if flags & os.O_TRUNC:
                creation = CREATE_ALWAYS
            elif flags & os.O_EXCL:
                creation = CREATE_NEW
            else:
                creation = OPEN_ALWAYS
        else:
            creation = OPEN_EXISTING

        handle = ctypes.windll.kernel32.CreateFileW(
            path,  # lpFileName
            access,  # dwDesiredAccess
            share_mode,  # dwShareMode
            None,  # lpSecurityAttributes
            creation,  # dwCreationDisposition
            FILE_ATTRIBUTE_NORMAL,  # dwFlagsAndAttributes
            None,  # hTemplateFile
        )
        if handle == INVALID_HANDLE_VALUE:
            raise ctypes.WinError()

        return msvcrt.open_osfhandle(handle, flags)

    return opener


with open("./spam", "w", encoding="utf-8", opener=sharing("d")) as f:
    print(f.write("write"))
    input()  # 消せる
```
