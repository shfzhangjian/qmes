import os


def create_project_structure():
    # 定义根目录
    root_dir = "D:\\qingdao\\qmes\\ui\\src"

    # 定义需要创建的目录列表 (包含子目录)
    directories = [
        "assets",
        "components",
        "context",
        "data",
        "features/AIAgent",
        "features/Dashboard",
        "features/Layout",
        "features/Planning",
        "services",
        "styles",
        "utils"
    ]

    # 定义需要创建的文件列表 (相对于 src)
    files = [
        "data/menu.json",
        "services/api.js",
        "styles/index.css",
        "App.jsx",
        "main.jsx"
    ]

    print(f"🚀 开始构建目录结构: {root_dir}...")

    # 1. 创建根目录
    if not os.path.exists(root_dir):
        os.makedirs(root_dir)
        print(f"  + 创建根目录: {root_dir}")

    # 2. 创建子目录
    for directory in directories:
        dir_path = os.path.join(root_dir, directory)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            print(f"  + 创建目录: {dir_path}")
        else:
            print(f"  . 目录已存在: {dir_path}")

    # 3. 创建 UTF-8 空文件
    for file_name in files:
        file_path = os.path.join(root_dir, file_name)

        # 确保文件的父目录存在 (双重保险)
        parent_dir = os.path.dirname(file_path)
        if not os.path.exists(parent_dir):
            os.makedirs(parent_dir)

        # 创建空文件 (如果不写入内容，open 配合 'w' 模式即可)
        if not os.path.exists(file_path):
            with open(file_path, 'w', encoding='utf-8') as f:
                pass  # pass 表示什么都不做，只是创建文件
            print(f"  + 创建文件: {file_path}")
        else:
            print(f"  . 文件已存在: {file_path}")

    print("\n✅ 项目结构构建完成！")


if __name__ == "__main__":
    create_project_structure()