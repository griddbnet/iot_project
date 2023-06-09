FROM jupyter/minimal-notebook:latest

USER root
RUN wget --no-check-certificate https://github.com/griddb/c_client/releases/download/v5.0.0/griddb-c-client_5.0.0_amd64.deb
RUN dpkg -i griddb-c-client_5.0.0_amd64.deb
RUN rm -f griddb-c-client_5.0.0_amd64.deb

RUN pip install numpy pandas griddb-python

ADD Analysis.ipynb /home/jovyan/
