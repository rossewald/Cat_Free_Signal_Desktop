# Installation Instructions for Mac:

## 1. Check you have these dependencies installed:

a. git

b. XCode command-line tools

c. npm

## 2. Install additional packages by running these commands from the terminal:

pip install -U pip setuptools

pip install graphviz hypothesis ipython jupyter matplotlib notebook pydot python-nvd3 pyyaml requests scikit-image scipy
    
conda install pytorch-nightly-cpu -c pytorch

brew install unzip zeromq

nvm use

brew install git-lfs

git clone https://github.com/rossewald/Cat_Free_Signal_Desktop.git

cd Signal-Desktop

npm install --global yarn  (only if you don’t already have `yarn`)

yarn install --frozen-lockfile

yarn grunt --force

yarn start

## If the above fails, further installation instructions are available here.

This project runs on Caffe2 and Signal. Following the installation instruction guides for each will allow you to run the proof-of-concept.

Caffe2 Installation Guides:

https://caffe2.ai/docs/getting-started.html?platform=mac&configuration=prebuilt

https://caffe2.ai/docs/tutorials.html

Signal-Desktop Installation Guide:

https://github.com/rossewald/Signal-Desktop/blob/development/CONTRIBUTING.md
