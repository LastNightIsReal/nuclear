import React, { useState } from 'react';
import styles from './styles.scss';
import cx from 'classnames';

type NuclearImageReplacementProps = {
    className?: string;
};

export type NuclearImageProps = {
    src: string;
    onLoad?: React.ReactEventHandler<HTMLImageElement>;
    Loader?: React.ComponentType<NuclearImageReplacementProps> | null;
    Error?: React.ComponentType<NuclearImageReplacementProps> | null;
} & React.ImgHTMLAttributes<HTMLImageElement>;


const NuclearImage: React.FC<NuclearImageProps> = ({
  src,
  onLoad,
  Loader = null,
  Error = null,
  className,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {isLoading && Loader && <Loader className={className} />}
      {hasError && Error && <Error className={className} />}
      <img
        className={cx(
          {
            [styles.visually_hidden]: isLoading || hasError
          },
          className
        )}
        src={src}
        onLoad={(e) => {
          onLoad?.(e);
          setIsLoading(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...rest}
      />
    </>
  );
};

export default NuclearImage;
