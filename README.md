## Introduction to ELK Stack using Docker and Deno

The ELK Stack, consisting of Elasticsearch, Logstash, and Kibana, is a set of powerful tools for searching, analyzing, and visualizing data in real-time. In this introductory guide, we will set up a simple ELK stack using Docker, and send logs to it from a Deno application.

```
project-directory
│
├── docker-compose.yml   # Docker Compose configuration file
├── logstash-config      # Directory containing Logstash configuration
│   └── logstash.conf    # Logstash configuration file
└── app.ts               # Deno script for sending logs
└── README.md
```

### How to **Run**:

- Ensure `Docker` and `Docker Compose` are installed on your machine.
- Navigate to the project directory in a terminal.
- Run `docker-compose up` to start the `ELK` stack.
- In a separate terminal, run this to send a log message to Logstash.

```
deno run --allow-net app.ts
```

- Open Kibana at `http://localhost:5601` to view and analyze the logs.

### Glossary

- `Elasticsearch` is a **search and analytics engine**. It **stores** and **indexes** data, making it **searchable**.
- `Logstash` is a **server-side data processing** pipeline. It ingests data from various sources, transforms it, and sends it to a `stash` like Elasticsearch.
- `Kibana` is a data visualization **dashboard** for Elasticsearch. It provides visualization capabilities on top of the content indexed on an Elasticsearch cluster.
- `Deno` is a secure runtime for JavaScript and TypeScript. In this example, we use a Deno script to send log messages to Logstash.

### To Try

#### X-Pack Security

By setting `xpack.security.enabled` to `true` in both `Elasticsearch` and `Kibana` services, you enable `X-Pack` security features, which include built-in

- user authentication
- role-based access control
- encrypted communications

#### Persistent Volume for Elasticsearch

The `volumes` configuration under the Elasticsearch service and at the bottom of the file ensures that **Elasticsearch data is persisted across container restarts**.

Example:

```
elasticsearch:
image: docker.elastic.co/elasticsearch/elasticsearch:8.10.1
environment:
    - "discovery.type=single-node"
    - "xpack.security.enabled=true"  # Enables X-Pack security features
ports:
    - "9200:9200"
volumes:
    - es-data:/usr/share/elasticsearch/data  # Persistent volume for Elasticsearch data
```

#### Monitoring

The `xpack.monitoring.elasticsearch.hosts` environment variable in the Logstash service enables **monitoring of Logstash with X-Pack** by specifying the Elasticsearch hosts to send monitoring data to.

Example:

```
logstash:
    image: docker.elastic.co/logstash/logstash:8.10.1
    ports:
      - "5044:5044"
    volumes:
      - ./logstash-config:/usr/share/logstash/pipeline
    environment:
      - "xpack.monitoring.elasticsearch.hosts=http://elasticsearch:9200"  # Enables monitoring with X-Pack
```

#### JSON Codec

The `codec => json` line specifies that incoming data should be treated as JSON. This is useful if your logs are structured as JSON objects.

Example:

```
input {
  tcp {
    port => 5044
    codec => json  # Specifies the codec used to decode the incoming data
  }
}

```

#### Grok Filter

The `grok` filter is a powerful tool for **parsing unstructured log data** into structured data by **applying patterns** to the **incoming data**.

Example:

```
filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }  # Parses common log formats
  }
}
```

Note: To be placed in `logstash.conf`

#### Daily Indexing

The `index` configuration could be added in the output block to create a new index in `Elasticsearch` every day, which can be useful for managing **large volumes of log data**.

Example:

```
output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logstash-%{+YYYY.MM.dd}"  # Daily indexing
    user => "logstash_internal"  # Optional: user for secured Elasticsearch cluster
    password => "password"  # Optional: password for secured Elasticsearch cluster
  }
}
```

Note: The `user` and `password` options are used when you have `X-Pack` security enabled and need to provide credentials to write to **Elasticsearch**.
