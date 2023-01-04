import { createDockerDesktopClient } from "@docker/extension-api-client";
import { useEffect, useState } from "react";

/**
 * {
 *   "Command": "\"/usr/local/bin/dock…\"",
 *   "CreatedAt": "2022-09-30 13:32:59 +0200 CEST",
 *   "ID": "45d644408dfe",
 *   "Image": "logstash:7.16.1",
 *   "Labels": "com.docker.compose.project.config_files=/Users/benjamingrandfond/Dev/docker/awesome-compose/elasticsearch-logstash-kibana/compose.yaml,org.opencontainers.image.description=Logstash is a free and open server-side data processing pipeline that ingests data from a multitude of sources, transforms it, and then sends it to your favorite 'stash.',org.opencontainers.image.vendor=Elastic,org.label-schema.url=https://www.elastic.co/products/logstash,org.opencontainers.image.created=2021-12-11T00:29:46+00:00,com.docker.compose.project.working_dir=/Users/benjamingrandfond/Dev/docker/awesome-compose/elasticsearch-logstash-kibana,desktop.docker.io/binds/0/Source=/Users/benjamingrandfond/Dev/docker/awesome-compose/elasticsearch-logstash-kibana/logstash/pipeline/logstash-nginx.config,org.label-schema.build-date=2021-12-11T00:29:46+00:00,org.label-schema.license=Elastic License,com.docker.compose.service=logstash,desktop.docker.io/binds/1/Source=/Users/benjamingrandfond/Dev/docker/awesome-compose/elasticsearch-logstash-kibana/logstash/nginx.log,org.opencontainers.image.licenses=Elastic License,org.opencontainers.image.title=logstash,desktop.docker.io/binds/0/Target=/usr/share/logstash/pipeline/logstash-nginx.config,org.label-schema.schema-version=1.0,org.label-schema.vendor=Elastic,com.docker.compose.config-hash=6f89de57c0abded663f5e1d386aa06e305c3b96fa237a39635d55b12d492e3c9,com.docker.compose.depends_on=elasticsearch:service_started,com.docker.compose.project=elasticsearch-logstash-kibana,com.docker.compose.version=2.11.0,org.label-schema.version=7.16.1,com.docker.compose.image=sha256:ad59301e2cf54c48f9107f238bfc3e8d642a2c2f58150587c262f6af747ee42c,com.docker.compose.oneoff=False,desktop.docker.io/binds/1/SourceKind=hostFile,desktop.docker.io/binds/1/Target=/home/nginx.log,org.label-schema.name=logstash,com.docker.compose.number=1,desktop.docker.io/binds/0/SourceKind=hostFile,org.label-schema.vcs-url=https://github.com/elastic/logstash,org.opencontainers.image.version=7.16.1",
 *   "LocalVolumes": "0",
 *   "Mounts": "/host_mnt/User…,/host_mnt/User…",
 *   "Names": "log",
 *   "Networks": "elasticsearch-logstash-kibana_elastic",
 *   "Ports": "0.0.0.0:5044-\u003e5044/tcp, 0.0.0.0:9600-\u003e9600/tcp, 0.0.0.0:5001-\u003e5000/tcp, 0.0.0.0:5001-\u003e5000/udp",
 *   "RunningFor": "2 days ago",
 *   "Size": "195MB (virtual 1.9GB)",
 *   "State": "running",
 *   "Status": "Up 2 days"
 * }
 */
interface ContainerData {
  Command: string;
  CreatedAt: string;
  ID: string;
  Image: string;
  Labels: string;
  LocalVolumes: string;
  Mounts: string;
  Names: string;
  Networks: string;
  Ports: string;
  RunningFor: string;
  Size: string;
  State: "running" | "exited";
  Status: string;
}

export interface IContainer {
  id: string;
  state: "running" | "exited";
  labels: Label[];
  isSystemContainer: boolean;
  composeProject?: string;
  Image: string;
  Names: string;
}

interface Label {
  key: string;
  value: string;
}

export enum EventStatus {
  START = 'start',
  DESTROY = 'destroy',
  STOP = 'stop',
  DIE = 'die',
  KILL = 'kill',
}

export interface Event {
  status: EventStatus;
  id: string;
  from: string;
  Actor: {
    Attributes: {
      [key: string]: string;
    };
  };
}

const ddClient = createDockerDesktopClient();

export function useContainers() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<undefined | IContainer[]>();

  const containers = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    const containers: IContainer[] = [];

    try {
      const result = await ddClient.docker.cli.exec("ps", [
        "--all",
        "--no-trunc",
        "--format",
        '"{{json .}}"',
      ]);
      const containerData: ContainerData[] = result.parseJsonLines();

      for (const key in containerData) {
        const value = containerData[key];
        const labels = parseLabels(value.Labels);
        containers.push({
          id: value.ID,
          state: value.State,
          isSystemContainer:
            isExtensionContainer(value) || isK8sContainer(value),
          labels: labels,
          composeProject: labels.find(
            (l) => l.key === "com.docker.compose.project"
          )?.value,
          Image: value.Image,
          Names: value.Names,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

    setData(containers);
  };

  useEffect(() => {
    containers();
  }, []);

  useEffect(() => {
    const process = ddClient.docker.cli.exec(
      'events',
      [
        '--filter',
        'type=container',
        '--filter',
        'event=start',
        '--filter',
        'event=stop',
        '--filter',
        'event=kill',
        '--filter',
        'event=die',
        '--filter',
        'event=destroy',
        '--format',
        '{{json .}}',
      ],
      {
        stream: {
          splitOutputLines: true,
          async onOutput(data) {
            const event = JSON.parse(data.stdout ?? data.stderr) as Event;

            if (!event) {
              return;
            }

            switch (event.status) {
              case EventStatus.START:
              case EventStatus.STOP:
              case EventStatus.DIE:
              case EventStatus.KILL:
              case EventStatus.DESTROY: {
                containers();
                break;
              }
              default: {
                break;
              }
            }
          },
        },
      },
    );

    return () => {
      process.close();
    };
  }, []);

  return { containers, isLoading, data };
}

function isExtensionContainer(container: ContainerData) {
  return parseLabels(container.Labels).some(
    (l) => "com.docker.desktop.extension" == l.key
  );
}

function isK8sContainer(container: ContainerData) {
  return parseLabels(container.Labels).some((l) =>
    [
      "podsandbox",
      "io.kubernetes.pod.namespace",
      "kube-system",
      "docker",
      "io.kubernetes",
    ].includes(l.key)
  );
}

function parseLabels(labels: string): Label[] {
  return labels.split(",").reduce((labels, l) => {
    const [key, value] = l.split("=");

    return [...labels, { key, value }];
  }, [] as Label[]);
}
