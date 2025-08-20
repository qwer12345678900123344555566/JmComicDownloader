import hashlib

def get_num(e: str, t: str) -> int:
    print(f"\n>>> 开始计算: e={e}, t={t}")

    # 先将e转换为整数用于范围判断
    try:
        e_int = int(e)
        print(f"[0] e 的整数值: {e_int}")
    except ValueError:
        print(f"[0] 错误: e='{e}' 不是有效的整数")
        return 10  # 默认值

    # 第一个范围：早期aid不分割
    if e_int < 220980:
        print(f"[1] e={e_int} < 220980 → 返回 0（不分割）")
        return 0

    # 拼接字符串
    concat = e + t
    print(f"[2] 拼接字符串: {concat}")

    # 计算 md5
    md5_val = hashlib.md5(concat.encode("utf-8")).hexdigest()
    print(f"[3] MD5: {md5_val}")

    # 取最后一位
    last_char = md5_val[-1]
    print(f"[4] MD5 最后一位: '{last_char}'")

    # 转成 charCode
    n = ord(last_char)
    print(f"[5] charCode: {n}")

    # 范围判断
    if 268850 <= e_int <= 421925:
        n = n % 10
        print(f"[6] e 在 268850~421925 范围内 → n % 10 = {n}")
    elif e_int >= 421926:
        n = n % 8
        print(f"[6] e ≥ 421926 → n % 8 = {n}")
    else:
        # 220980 ≤ e_int < 268850 的情况
        print(f"[6] 220980 ≤ e < 268850 → 不取余，n={n}")

    # 映射
    mapping = {
        0: 2, 1: 4, 2: 6, 3: 8, 4: 10,
        5: 12, 6: 14, 7: 16, 8: 18, 9: 20
    }
    
    # 检查n是否在映射范围内
    if n in mapping:
        a = mapping[n]
        print(f"[7] 映射: n={n} → {a}")
    else:
        a = 10
        print(f"[7] n={n} 不在映射表中 → 使用默认值 {a}")

    print(f"[8] 最终结果: {a}\n")
    return a


if __name__ == "__main__":
    print("输入 e 和 t 进行计算（输入 '退出' 可结束）")
    print("注意: e 应该是数字字符串，t 是文件名标识")
    
    while True:
        e = input("\n请输入 e (aid): ").strip()
        if e.lower() in ['退出', 'exit', 'quit']:
            print("程序已退出。")
            break

        t = input("请输入 t (filename): ").strip()
        if t.lower() in ['退出', 'exit', 'quit']:
            print("程序已退出。")
            break

        try:
            result = get_num(e, t)
            print(f"🎯 最终分割块数: {result}")
            
            # 添加结果解释
            if result == 0:
                print("💡 这意味着图片不会被分割！")
            else:
                print(f"💡 图片将被水平分割成 {result} 块")
                
        except Exception as ex:
            print(f"❌ 出错: {ex}\n")