# Installation Instructions for Mac:

## 1. Check you have these dependencies installed:

a. git

b. XCode command-line tools

c. npm

## 2. Install additional packages by running these commands from the terminal:

a. pip install -U pip setuptools

b. pip install \
    graphviz \
    hypothesis \
    ipython \
    jupyter \
    matplotlib \
    notebook \
    pydot \
    python-nvd3 \
    pyyaml \
    requests \
    scikit-image \
    scipy
    
c. conda install pytorch-nightly-cpu -c pytorch

d. brew install unzip zeromq

3. Set up and run the Cat-Free Signal-Desktop repo

a. nvm use

b. brew install git-lfs

c. git clone https://github.com/rossewald/Cat_Free_Signal_Desktop.git

d. cd Signal-Desktop

e. npm install --global yarn  (only if you don’t already have `yarn`)

f. yarn install --frozen-lockfile

g. yarn grunt --force

h. yarn start
